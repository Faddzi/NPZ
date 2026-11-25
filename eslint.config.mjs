import next from 'eslint-config-next/core-web-vitals';

const config = [
  ...next,
  { ignores: ['out/**', '.next/**', 'scripts/**'] },
  {
    // React Compiler rules added in Next 16. The 3D scene mutates three.js objects and syncs refs on purpose,
    // so these stay as warnings rather than errors.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];
export default config;
