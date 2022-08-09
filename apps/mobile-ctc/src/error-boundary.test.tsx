import {render} from '@testing-library/react-native';
import {ErrorFallback} from './error-boundary';
import ErrorBoundary from 'react-error-boundary';

describe('<ErrorBoundary />', () => {
  test('Renders correctly', () => {
    const {container} = render(<ErrorBoundary />);
    expect(container).toMatchSnapshot();
  });
});
