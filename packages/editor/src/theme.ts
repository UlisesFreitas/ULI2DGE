import { createTheme } from '@mui/material/styles';

// Define nuestro tema base para el editor.
// Usaremos un tema oscuro para que sea más cómodo para la vista durante largas sesiones.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Un azul claro para los elementos primarios
    },
    secondary: {
      main: '#f48fb1', // Un rosa para los elementos secundarios
    },
    background: {
      default: '#121212', // Fondo principal muy oscuro
      paper: '#1e1e1e', // Fondo para superficies como paneles y menús
    },
  },
});

export default theme;