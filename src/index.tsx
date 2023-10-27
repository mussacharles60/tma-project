import './index.scss';

import App from './components/app';

const { createRoot } = require("react-dom/client");

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);