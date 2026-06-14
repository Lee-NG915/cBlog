const messageMap: Map<string, string> = new Map();

messageMap.set('default', 'some wrong things happened');

messageMap.set('phone', 'Please provide a valid phone number.');
messageMap.set('userName', 'Please enter a username containing 6 to 12 alphabet letters.');
messageMap.set('fLame', 'This field contains less than 32 characters.');
messageMap.set('password', 'This field contains more than 8 character,contains 0-9a-zA-Z');
messageMap.set('date', 'Please select or enter the correct Date.');
messageMap.set('email', 'Please enter a valid email address.');

export default messageMap;
