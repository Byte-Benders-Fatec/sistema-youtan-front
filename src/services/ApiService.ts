import axios from 'axios'
import HttpStatus from 'http-status-codes'

class ApiService {

  private readonly baseUrl: string
  public headers: Record<string, string>

  constructor() {
    this.baseUrl = import.meta.env.VITE_BASE_URL,
    this.headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }

  public get(url: string, params?: any) {
    return this.request('GET', url, undefined, params)
  }

  public post(url: string, data: any) {
    return this.request('POST', url, data)
  }

  public put(url: string, data: any) {
    return this.request('PUT', url, data)
  }

  public delete(url: string) {
    return this.request('DELETE', url)
  }

  private async request(method: string, url: string, data?: any, params?: any) {
    const config = {
      method,
      url: `${this.baseUrl}/${url}`,
      withCredentials: true,
      headers: this.headers,
      data,
      params
    }

    return axios.request(config)
  }
}

if(import.meta.env.VITE_SKIP_AUTH !== 'true' || import.meta.env.VITE_SKIP_AUTH !== true) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === HttpStatus.UNAUTHORIZED) {
        localStorage.removeItem('import.meta.env.VITE_AUTH_COOKIE_NAME')
      }
      return Promise.reject(error)
    }
  )
}

export default ApiService