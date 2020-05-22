const framebus = {
  emit: jest.fn().mockReturnValue(true),
  on: jest.fn().mockReturnValue(true),
};

export = framebus;
