if (typeof global !== 'undefined') {
  // Enable React 18 act() support in tests
  // See https://react.dev/warnings/react-test-renderer for details
  (global as any).IS_REACT_ACT_ENVIRONMENT = true;
}

// Silence Alert dialogs in tests
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Alert } = require('react-native');
  if (Alert && Alert.alert) {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  }
} catch {}
