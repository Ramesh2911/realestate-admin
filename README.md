# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


admin/
│
├── public/
│
├── src/
│
├── assets/
│
├── components/
│
│── common/
│
│── layout/
│
│── dashboard/
│
│── property/
│
│── user/
│
├── layouts/
│
│   AdminLayout.jsx
│
├── pages/
│
│── Login/
│
│── Dashboard/
│
│── Users/
│
│── Property/
│
│     Pending.jsx
│     Approved.jsx
│     Rejected.jsx
│
│── Verification/
│
│── Leads/
│
│── Notification/
│
│── Profile/
│
│── ChangePassword/
│
│── Banner/
│
│── Blog/
│
│── SEO/
│
│── Settings/
│
├── routes/
│
│   AdminRoutes.jsx
│
│   PrivateRoute.jsx
│
├── services/
│
│   api.js
│
│   auth.service.js
│
│   dashboard.service.js
│
│   property.service.js
│
│   user.service.js
│
│   lead.service.js
│
├── redux/
│
├── context/
│
├── utils/
│
├── App.jsx
│
└── main.jsx