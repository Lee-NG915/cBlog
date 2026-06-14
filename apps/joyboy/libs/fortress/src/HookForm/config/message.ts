const messageMap: Map<string, string> = new Map();

messageMap.set('default', 'some wrong things happened');

messageMap.set('phone', 'Please provide a valid phone number.');
messageMap.set('userName', 'This field contains less than 32 alphabet letters.');
messageMap.set('fLName', 'This field contains 2 to 20 alphabet letters.');
messageMap.set('password', 'This field contains more than 8 character,contains 0-9a-zA-Z');
messageMap.set('date', 'Please select or enter the correct Date.');
messageMap.set('email', 'Please enter a valid email address.');
messageMap.set('zipCode', 'Please enter a valid zip code.');

export default messageMap;
