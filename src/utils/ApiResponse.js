class ApiResponce {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode == 200;
  }
}
export default ApiResponce;
