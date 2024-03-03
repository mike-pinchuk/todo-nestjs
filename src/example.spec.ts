class FriendsList {
  friends = [];

  addFriend(name) {
    this.friends.push(name);
    this.announcedFriendship(name);
  }

  announcedFriendship(name: string) {
    global.console.log(name);
  }

  removeFriend(name) {
    const idx = this.friends.indexOf(name);

    if (idx === -1) {
      throw new Error('Friend not found');
    }

    this.friends.splice(idx, 1);
  }
}

/////
describe('FriendsList', () => {
  let friendsList;

  beforeEach(() => {
    friendsList = new FriendsList();
  });
  it('initialize friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  it('add friend to friends list', () => {
    friendsList.addFriend('John');

    expect(friendsList.friends.length).toEqual(1);
    expect(friendsList.friends).toEqual(['John']);
  });

  it('announced friendship', () => {
    friendsList.announcedFriendship = jest.fn();

    expect(friendsList.announcedFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('John');
    expect(friendsList.announcedFriendship).toHaveBeenCalledWith('John');
  });

  describe('remove friend', () => {
    it('removes the friend from the list', () => {
      friendsList.addFriend('John');
      expect(friendsList.friends[0]).toEqual('John');
      friendsList.removeFriend('John');
      expect(friendsList.friends[0]).toBeUndefined();

      // expect(friendsList.removeFriend).toHaveBeenCalled()
    });

    it('throws an error as friend is not exist', () => {
      expect(() => friendsList.removeFriend('John')).toThrow(
        new Error('Friend not found'),
      );
    });
  });
});
