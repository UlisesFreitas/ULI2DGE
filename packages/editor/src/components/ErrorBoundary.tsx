import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in a component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box
            p={2}
            sx={{
              color: (theme) => theme.palette.error.main,
            }}
          >
            <Typography variant="h6">Error</Typography>
            <Typography variant="body2">This panel has crashed.</Typography>
          </Box>
        )
      );
    }

    return this.props.children;
  }
}
