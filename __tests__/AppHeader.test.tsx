import React from 'react';
import { create, act } from 'react-test-renderer';
import { AppHeader } from '../components/AppHeader';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('div', props),
    Pressable: (props: any) => React.createElement('button', props),
    StyleSheet: { create: () => ({}) },
    PixelRatio: { get: () => 2 },
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props: any) => React.createElement('icon', props),
  };
});

jest.mock('~/components/nativewindui/Text', () => {
  const React = require('react');
  return {
    Text: (props: any) => React.createElement('span', props, props.children),
  };
});

describe('AppHeader', () => {
  it('renders title and back button', () => {
    const goBack = jest.fn();
    const tree = create(
      <AppHeader
        navigation={{ goBack } as any}
        options={{ title: 'Hello' }}
        back={{} as any}
      />
    );
    const title = tree.root.findByProps({ testID: 'header-title' });
    expect(title.props.children).toBe('Hello');
    act(() => {
      tree.root.findByProps({ testID: 'header-back' }).props.onPress();
    });
    expect(goBack).toHaveBeenCalled();
  });

  it('uses close icon for modal', () => {
    const tree = create(
      <AppHeader
        navigation={{ goBack: jest.fn() } as any}
        options={{ title: 'Modal', presentation: 'modal' } as any}
        back={{} as any}
      />
    );
    const icon = tree.root.findByType(require('@expo/vector-icons').Ionicons);
    expect(icon.props.name).toBe('close');
  });
});
