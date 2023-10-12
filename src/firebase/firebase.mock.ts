jest.mock('firebase-admin', () => {
  const userDocMock = {
    exists: true,
    id: 'someUserId',
    data: () => ({
      name: 'John Doe',
      email: 'john.doe@example.com',
      players: {},
    }),
  };

  const mockedFirestore = {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValueOnce(userDocMock),
      }),
    }),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnValue(mockedFirestore),
  };
});

// const mockFirestoreData = {
//   'someUserId': {
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     players: {
//       'somePlayerId': {
//         name: 'Player1',
//         stats: {
//           someTournamentId: {
//             games: 10,
//             win: 5,
//             points: 50,
//           }
//         }
//       }
//     }
//   }
// };

// const docMock = (id) => ({
//   get: jest.fn().mockResolvedValueOnce({
//     exists: !!mockFirestoreData[id],
//     id,
//     data: () => mockFirestoreData[id]
//   }),
//   set: jest.fn(),
//   update: jest.fn()
// });

// jest.mock('firebase-admin', () => ({
//   initializeApp: jest.fn(),
//   firestore: jest.fn().mockReturnValue({
//     collection: jest.fn().mockReturnValue({
//       doc: jest.fn().mockImplementation(docMock),
//     }),
//   }),
// }));
