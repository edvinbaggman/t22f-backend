jest.mock('firebase-admin', () => {
  const userDocMock = {
    exists: true,
    id: 'user1',
    data: () => ({
      name: 'John Doe',
      email: 'john.doe@example.com',
      players: {
        '1234': {
          name: 'Player1',
          sex: 'man',
          stats: {},
        },
      },
    }),
  };

  let mockUserDocument = { ...userDocMock };

  const docMock = {
    get: jest.fn().mockImplementation(() => Promise.resolve(mockUserDocument)),
    set: jest.fn().mockImplementation((data) => {
      mockUserDocument = {
        exists: true,
        id: '123456789',
        data: () => data,
      };
    }),
  };

  const collectionMock = {
    doc: jest.fn().mockReturnValue(docMock),
  };

  const mockedFirestore = {
    collection: jest.fn().mockReturnValue(collectionMock),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnValue(mockedFirestore),
  };
});
