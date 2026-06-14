// {
//   "errors": [
//       {
//           "status": "Not Found",
//           "code": 40009,
//           "detail": "The resource you were looking for could not be found.",
//           "meta": {},
//           "title": "Resource Not Found"
//       }
//   ]
// }

export interface ErrorDetail {
  status: string;
  code: number;
  detail: string;
  meta: Record<string, any>;
  title: string;
}

export interface RailsError {
  errors: ErrorDetail[];
}
