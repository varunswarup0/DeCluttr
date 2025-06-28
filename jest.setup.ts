if (typeof global !== 'undefined') {
  // Enable React 18 act() support in tests
  // See https://react.dev/warnings/react-test-renderer for details
  (global as any).IS_REACT_ACT_ENVIRONMENT = true;
}
