import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Plus, Users, MessageCircle, DollarSign } from 'lucide-react';

interface FriendsListProps {
  onBack: () => void;
}

interface Friend {
  id: number;
  name: string;
  email: string;
  avatar: string;
  balance: number;
}

interface Group {
  id: number;
  name: string;
  members: string[];
  totalExpenses: number;
}

const mockFriends: Friend[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@email.com', avatar: '👩', balance: -25.50 },
  { id: 2, name: 'Bob Smith', email: 'bob@email.com', avatar: '👨', balance: 18.75 },
  { id: 3, name: 'Carol Davis', email: 'carol@email.com', avatar: '👩‍🦱', balance: -12.00 },
  { id: 4, name: 'David Wilson', email: 'david@email.com', avatar: '👨‍🦲', balance: 35.25 },
  { id: 5, name: 'Emma Brown', email: 'emma@email.com', avatar: '👩‍🦰', balance: -8.50 },
];

const initialGroups: Group[] = [
  { id: 1, name: 'Office Team', members: ['You', 'Alice Johnson', 'Bob Smith'], totalExpenses: 245.50 },
  { id: 2, name: 'Weekend Trip', members: ['You', 'Carol Davis', 'David Wilson', 'Emma Brown'], totalExpenses: 380.00 },
];

export function FriendsList({ onBack }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['You']);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');

  const addFriend = () => {
    if (newFriendEmail) {
      const newFriend: Friend = {
        id: Date.now(),
        name: newFriendEmail.split('@')[0],
        email: newFriendEmail,
        avatar: '👤',
        balance: 0
      };
      setFriends([...friends, newFriend]);
      setNewFriendEmail('');
    }
  };

  const createGroup = () => {
    if (newGroupName && selectedMembers.length > 1) {
      const newGroup: Group = {
        id: Date.now(),
        name: newGroupName,
        members: selectedMembers,
        totalExpenses: 0
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setSelectedMembers(['You']);
    }
  };

  const toggleMember = (memberName: string) => {
    if (memberName === 'You') return; // You can't be removed
    
    if (selectedMembers.includes(memberName)) {
      setSelectedMembers(selectedMembers.filter(m => m !== memberName));
    } else {
      setSelectedMembers([...selectedMembers, memberName]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 border-blue-400/50 text-white"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
            Friends & Groups
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('friends')}
            className={`${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            } border-0`}
          >
            <Users className="h-4 w-4 mr-2" />
            Friends
          </Button>
          <Button
            onClick={() => setActiveTab('groups')}
            className={`${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            } border-0`}
          >
            <Users className="h-4 w-4 mr-2" />
            Groups
          </Button>
        </div>

        {activeTab === 'friends' && (
          <>
            {/* Add Friend */}
            <Card className="bg-white/10 backdrop-blur-md border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Friend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter friend's email"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    className="bg-white/10 border-blue-400/50 text-white placeholder:text-blue-200"
                  />
                  <Button
                    onClick={addFriend}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Friends List */}
            <Card className="bg-white/10 backdrop-blur-md border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white">Your Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{friend.avatar}</div>
                        <div>
                          <p className="text-white">{friend.name}</p>
                          <p className="text-blue-200 text-sm">{friend.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`${friend.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {friend.balance >= 0 ? 'Owes you' : 'You owe'}
                          </p>
                          <p className={`${friend.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            ${Math.abs(friend.balance).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-500 text-white border-0"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            {/* Create Group */}
            <Card className="bg-white/10 backdrop-blur-md border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-white/10 border-blue-400/50 text-white placeholder:text-blue-200"
                />
                
                <div>
                  <p className="text-blue-200 mb-2">Select Members:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-blue-600/20">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="text-blue-600"
                      />
                      <span className="text-white">You</span>
                    </div>
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                        onClick={() => toggleMember(friend.name)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(friend.name)}
                          readOnly
                          className="text-blue-600"
                        />
                        <span className="text-white">{friend.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={createGroup}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                  disabled={!newGroupName || selectedMembers.length < 2}
                >
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Groups List */}
            <Card className="bg-white/10 backdrop-blur-md border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white">Your Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div key={group.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white">{group.name}</h3>
                        <div className="flex items-center gap-2 text-blue-200">
                          <DollarSign className="h-4 w-4" />
                          <span>${group.totalExpenses.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-300" />
                        <span className="text-blue-200 text-sm">
                          {group.members.length} members: {group.members.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}