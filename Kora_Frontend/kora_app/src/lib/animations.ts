export const animations = {
  fadeIn: 'animate-fade-in',
  slideUpSm: 'animate-slide-up-sm',
  slideUpMd: 'animate-slide-up-md',
  slideUpLg: 'animate-slide-up-lg',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
};

export const animationDurations = {
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
};

export const tailwindAnimations = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUpSm {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUpMd {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUpLg {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
