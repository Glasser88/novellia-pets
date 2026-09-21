/** The signed-in user as the app sees them: enough to scope data and greet them. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}
