import moment from 'moment-timezone';

export function formatTime(date: string) {
  return moment(date).format('lll');
}
