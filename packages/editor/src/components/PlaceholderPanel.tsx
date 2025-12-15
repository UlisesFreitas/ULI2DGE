import { Box, Typography } from '@mui/material';

interface PlaceholderPanelProps {
  title: string;
}

export function PlaceholderPanel({ title }: PlaceholderPanelProps) {
  return <Box p={2}><Typography>{title}</Typography></Box>;
}