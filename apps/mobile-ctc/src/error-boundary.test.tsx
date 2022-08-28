import React from 'react';
import {render} from '@testing-library/react-native';
// import ErrorBoundary from 'react-error-boundary';
import {ErrorFallback} from './error-boundary';

describe('<ErrorBoundary />', () => {
  test('Renders correctly', () => {
    render(
      <>
        <ErrorFallback />
      </>,
    );
  });
});
