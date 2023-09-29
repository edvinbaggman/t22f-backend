jest.mock('firebase-admin', () => {
  const mockedFirestore = {
    collection: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            }),
          },
          {
            data: () => ({
              id: '2',
              name: 'Jane Doe',
              email: 'jane.doe@example.com',
            }),
          },
        ],
      }),
    }),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnValue(mockedFirestore),
  };
});
