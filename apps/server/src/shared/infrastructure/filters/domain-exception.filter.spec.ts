import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { InvalidCredentialsException } from '../../../contexts/iam/users/domain/exceptions/invalid-credentials.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
      }),
    } as unknown as ArgumentsHost;

    // Filter logs the raw error to console; silence it during tests.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('maps a known domain exception to its configured status', () => {
    filter.catch(new InvalidCredentialsException(), host);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, error: 'Unauthorized' }),
    );
  });

  it('preserves the status of a built-in HttpException', () => {
    filter.catch(new NotFoundException('missing'), host);

    expect(statusMock).toHaveBeenCalledWith(404);
  });

  it('falls back to 500 for an unmapped error', () => {
    filter.catch(new Error('boom'), host);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
      }),
    );
  });
});
