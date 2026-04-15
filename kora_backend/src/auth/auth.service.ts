import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly supabase: ReturnType<typeof createClient> | null;
  private readonly configErrorMessage: string | null;
  private readonly canUseAdminApi: boolean;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const serviceRoleKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
      '';

    const supabaseKey = serviceRoleKey || anonKey;

    const hasPlaceholderUrl =
      supabaseUrl.includes('your-project.supabase.co') ||
      supabaseUrl.includes('example.supabase.co');
    const hasPlaceholderKey =
      supabaseKey.includes('your-service-role-key') ||
      supabaseKey.includes('your-anon-key') ||
      supabaseKey.includes('replace-with-your-service-role-key') ||
      supabaseKey.includes('your-publishable-key');

    if (
      !supabaseUrl ||
      !supabaseKey ||
      hasPlaceholderUrl ||
      hasPlaceholderKey
    ) {
      this.supabase = null;
      this.configErrorMessage =
        'Invalid Supabase configuration. Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in backend .env with real values from your Supabase project.';
      this.canUseAdminApi = false;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.canUseAdminApi = Boolean(
      serviceRoleKey && !serviceRoleKey.includes('your-service-role-key'),
    );
    this.configErrorMessage = null;
  }

  async signup(signupDto: SignupDto) {
    if (!this.supabase) {
      throw new ServiceUnavailableException(this.configErrorMessage);
    }

    const { email, password, fullName, username } = signupDto;
    const displayName = fullName?.trim() || username;

    try {
      if (this.canUseAdminApi) {
        const { data: existingUsersData, error: listUsersError } =
          await this.supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

        if (listUsersError) {
          throw new BadRequestException(listUsersError.message);
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        const isEmailTaken = existingUsersData.users.some(
          (user) => user.email?.trim().toLowerCase() === normalizedEmail,
        );
        const isUsernameTaken = existingUsersData.users.some((user) => {
          const existingUsername =
            user.user_metadata && typeof user.user_metadata === 'object'
              ? (user.user_metadata['username'] as string | undefined)
              : undefined;

          return existingUsername?.trim().toLowerCase() === normalizedUsername;
        });

        if (isEmailTaken) {
          throw new BadRequestException('Email already registered');
        }

        if (isUsernameTaken) {
          throw new BadRequestException('Username already taken');
        }
      }

      const { data, error } = this.canUseAdminApi
        ? await this.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: displayName,
              username,
            },
          })
        : await this.supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: displayName,
                username,
              },
            },
          });

      if (error) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('already registered')
        ) {
          throw new BadRequestException('Email already registered');
        }
        if (error.message.toLowerCase().includes('username')) {
          throw new BadRequestException('Username already taken');
        }
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        message: 'Account created successfully',
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }

      const message = err instanceof Error ? err.message : '';
      const cause =
        err && typeof err === 'object' && 'cause' in err
          ? (err as { cause?: unknown }).cause
          : undefined;
      const causeMessage =
        cause && typeof cause === 'object' && 'message' in cause
          ? (cause as { message?: unknown }).message
          : '';
      const normalizedCauseMessage =
        typeof causeMessage === 'string' ? causeMessage : '';

      if (
        /fetch failed/i.test(message) ||
        /ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(normalizedCauseMessage)
      ) {
        throw new ServiceUnavailableException(
          'Auth provider is unreachable. Verify SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY and internet/DNS connectivity on the backend server.',
        );
      }

      throw new BadRequestException('Failed to create account');
    }
  }

  async login(loginDto: LoginDto) {
    if (!this.supabase) {
      throw new ServiceUnavailableException(this.configErrorMessage);
    }

    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (/email not confirmed/i.test(error.message)) {
          throw new UnauthorizedException(
            'Email not confirmed. Please verify your inbox before signing in.',
          );
        }
        throw new UnauthorizedException('Invalid email or password');
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Login successful',
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
