import { Socket } from 'socket.io-client';
import { ApiError, ApiErrorSchema } from './error';

/** API Options */
export type ApiOptions = {
  baseUrl?: string;
}

/** Jade Tree API Call Wrapper Class */
export class Api {
  /** API Base URL */
  baseUrl?: string;

  /** WebSocket Client */
  socket?: typeof Socket;

  /** Authorization Token */
  token?: string;

  /**
   * Calls the API endpoint using `fetch()`, handles API errors, and returns
   * a parsed object from the returned JSON. If the HTTP response is code 204
   * (No Data), void is returned.
   *
   * @param endpoint Endpoint URL, absolute or relative to `baseUrl`
   * @param options HTTP Request Options
   */
  call<T>(endpoint: string, options: RequestInit): Promise<T> {
    let fetchUrl = endpoint;
    if (fetchUrl.charAt(0) === '/' && this.baseUrl) {
      fetchUrl = `${this.baseUrl}${fetchUrl}`;
    }

    // Inject API Token into Request
    // TODO: Make more general middleware for request processing
    const request = new Request(fetchUrl, options);
    if (!request.headers.has('Authorization') && this.token) {
      request.headers.append('Authorization', `Bearer ${this.token}`);
    }

    // Request Data
    // TODO: Make more general middleware for response processing
    return fetch(request).then((response) => {
      if (!response.ok) {
        return response.json().then((data: ApiErrorSchema) => {
          if (!data.code || !data.status) {
            // Fake an APIError with no message or errors
            throw new ApiError(
              { code: response.status, message: response.statusText },
            );
          }

          // Reject Promise with API Error data
          throw new ApiError(data);
        });
      }

      // Handle HTTP 204 Response
      if (response.status === 204) {
        /* eslint-disable-next-line consistent-return */
        return/* void */;
      }

      // Handle JSON Response
      return response.json();
    });
  }

  /**
   * Send a DELETE request to the API
   *
   * @param endpoint Endpoint URL, absolute or relative to `baseUrl`
   * @param options HTTP Request Options
   */
  delete<T>(endpoint: string, options: RequestInit = { method: 'DELETE' }): Promise<T> {
    return this.call(endpoint, options);
  }

  /**
   * Send a GET request to the API
   *
   * @param endpoint Endpoint URL, absolute or relative to `baseUrl`
   * @param options HTTP Request Options
   */
  get<T>(endpoint: string, options: RequestInit = { method: 'GET' }): Promise<T> {
    return this.call(endpoint, options);
  }

  /**
   * Send a POST request to the API
   *
   * @param endpoint Endpoint URL, absolute or relative to `baseUrl`
   * @param payload Payload data to send to the API
   * @param options HTTP Request Options
   */
  post<T>(
    endpoint: string,
    payload: object | object[],
    options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  ): Promise<T> {
    return this.call(endpoint, options);
  }

  /**
   * Send a PUT request to the API
   *
   * @param endpoint Endpoint URL, absolute or relative to `baseUrl`
   * @param payload Payload data to send to the API
   * @param options HTTP Request Options
   */
  put<T>(
    endpoint: string,
    payload: object | object[],
    options: RequestInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  ): Promise<T> {
    return this.call(endpoint, options);
  }
}

/** API Singleton */
export default new Api();
