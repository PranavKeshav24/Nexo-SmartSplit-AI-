import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Plus, Trash2, Users, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ExpenseSplitterProps {
  onBack: () => void;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

const mockFriends = ['You', 'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown'];

export function ExpenseSplitter({ onBack }: ExpenseSplitterProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      description: 'Dinner at Restaurant',
      amount: 120.00,
      paidBy: 'You',
      participants: ['You', 'Alice Johnson', 'Bob Smith']
    }
  ]);
  
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Office Team',
      members: ['You', 'Alice Johnson', 'Bob Smith']
    },
    {
      id: '2',
      name: 'Weekend Trip',
      members: ['You', 'Carol Davis', 'David Wilson', 'Emma Brown']
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: 'You',
    participants: ['You'] as string[],
    groupId: '' as string
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    selectedMembers: ['You'] as string[]
  });

  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Toggle participant in new expense
  const toggleParticipant = (friend: string) => {
    if (friend === 'You') return; // You can't be removed
    
    const participants = newExpense.participants.includes(friend)
      ? newExpense.participants.filter(p => p !== friend)
      : [...newExpense.participants, friend];
    
    setNewExpense({ ...newExpense, participants });
  };

  // Toggle member in new group
  const toggleGroupMember = (friend: string) => {
    if (friend === 'You') return; // You can't be removed
    
    const members = newGroup.selectedMembers.includes(friend)
      ? newGroup.selectedMembers.filter(m => m !== friend)
      : [...newGroup.selectedMembers, friend];
    
    setNewGroup({ ...newGroup, selectedMembers: members });
  };

  // Select group for expense
  const selectGroupForExpense = (groupId: string) => {
    if (groupId === 'custom') {
      setNewExpense({ 
        ...newExpense, 
        groupId: '',
        participants: ['You']
      });
    } else {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setNewExpense({ 
          ...newExpense, 
          groupId: group.id,
          participants: [...group.members]
        });
      }
    }
  };

  // Create new group
  const createGroup = () => {
    if (newGroup.name && newGroup.selectedMembers.length > 1) {
      const group: Group = {
        id: Date.now().toString(),
        name: newGroup.name,
        members: newGroup.selectedMembers
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', selectedMembers: ['You'] });
      setShowGroupDialog(false);
    }
  };

  // Add expense
  const addExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.participants.length > 0) {
      const expense: ExpenseItem = {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        participants: newExpense.participants,
        groupId: newExpense.groupId
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        description: '',
        amount: '',
        paidBy: 'You',
        participants: ['You'],
        groupId: ''
      });
    }
  };

  // Remove expense
  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // Remove group
  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    // Remove group reference from expenses
    setExpenses(expenses.map(exp => 
      exp.groupId === id ? { ...exp, groupId: undefined } : exp
    ));
  };

  // Calculate split per person for an expense
  const calculateSplit = (expense: ExpenseItem) => {
    return expense.amount / expense.participants.length;
  };

  // Filter expenses by selected group
  const filteredExpenses = selectedGroup === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.groupId === selectedGroup);

  // Calculate balances
  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    
    mockFriends.forEach(friend => {
      balances[friend] = 0;
    });

    const expensesToCalculate = selectedGroup === 'all' ? expenses : filteredExpenses;

    expensesToCalculate.forEach(expense => {
      const splitAmount = calculateSplit(expense);
      
      // Payer gets credit for the full amount
      balances[expense.paidBy] += expense.amount;
      
      // Each participant owes their share
      expense.participants.forEach(participant => {
        balances[participant] -= splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              className="bg-white/5 hover:bg-white/10 border-blue-400/30 text-white backdrop-blur-sm"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl bg-gradient-to-r from-blue-300 via-blue-200 to-slate-200 bg-clip-text text-transparent">
              Expense Splitter
            </h1>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="bg-white/5 backdrop-blur-sm border border-blue-400/20">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              Groups
            </TabsTrigger>
          </TabsList>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses" className="space-y-6 mt-6">
            {/* Filter by Group */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <label className="text-blue-200">Filter by Group:</label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="bg-white/5 border-blue-400/30 text-white max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-600">
                      <SelectItem value="all" className="text-white hover:bg-blue-700">
                        All Expenses
                      </SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id} className="text-white hover:bg-blue-700">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Add New Expense */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white">Add New Expense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Expense description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="bg-white/5 border-blue-400/30 text-white placeholder:text-blue-300/50"
                  />
                  <Input
                    type="number"
                    placeholder="Amount ($)"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="bg-white/5 border-blue-400/30 text-white placeholder:text-blue-300/50"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    value={newExpense.paidBy}
                    onValueChange={(value) => setNewExpense({...newExpense, paidBy: value})}
                  >
                    <SelectTrigger className="bg-white/5 border-blue-400/30 text-white">
                      <SelectValue placeholder="Paid by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-600">
                      {mockFriends.map(friend => (
                        <SelectItem key={friend} value={friend} className="text-white hover:bg-blue-700">
                          {friend}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select onValueChange={selectGroupForExpense}>
                    <SelectTrigger className="bg-white/5 border-blue-400/30 text-white">
                      <SelectValue placeholder="Select group or custom" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-600">
                      <SelectItem value="custom" className="text-white hover:bg-blue-700">
                        Custom Selection
                      </SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id} className="text-white hover:bg-blue-700">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Participants Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-blue-200">
                      Split between {newExpense.participants.length} {newExpense.participants.length === 1 ? 'person' : 'people'}
                    </label>
                    <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-blue-400/30 text-blue-200 hover:bg-white/10"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Select Friends
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-blue-600 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-white">Select Participants</DialogTitle>
                          <DialogDescription className="text-blue-300">
                            Choose who will split this expense
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {mockFriends.map(friend => (
                            <div
                              key={friend}
                              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                                friend === 'You' 
                                  ? 'bg-blue-600/30 cursor-not-allowed' 
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                              onClick={() => friend !== 'You' && toggleParticipant(friend)}
                            >
                              <Checkbox
                                checked={newExpense.participants.includes(friend)}
                                disabled={friend === 'You'}
                                className="border-blue-400"
                              />
                              <span className="text-sm">{friend}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => setShowParticipantDialog(false)}
                          className="mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                        >
                          Done
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newExpense.participants.map(participant => (
                      <span 
                        key={participant}
                        className="px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-blue-200 text-sm"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={addExpense}
                  disabled={!newExpense.description || !newExpense.amount || newExpense.participants.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedGroup === 'all' ? 'All Expenses' : `${groups.find(g => g.id === selectedGroup)?.name} Expenses`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-400/20">
                        <TableHead className="text-blue-200">Description</TableHead>
                        <TableHead className="text-blue-200">Amount</TableHead>
                        <TableHead className="text-blue-200">Paid By</TableHead>
                        <TableHead className="text-blue-200">Split Among</TableHead>
                        <TableHead className="text-blue-200">Per Person</TableHead>
                        <TableHead className="text-blue-200">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-blue-300/50 py-8">
                            No expenses yet. Add your first expense above!
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <TableRow key={expense.id} className="border-blue-400/10">
                            <TableCell className="text-white">{expense.description}</TableCell>
                            <TableCell className="text-white">${expense.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-white">{expense.paidBy}</TableCell>
                            <TableCell className="text-blue-200 text-sm">
                              {expense.participants.length} {expense.participants.length === 1 ? 'person' : 'people'}
                            </TableCell>
                            <TableCell className="text-green-300">${calculateSplit(expense).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExpense(expense.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Summary */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white">Settlement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-400/20">
                    <p className="text-blue-200 text-sm">Total Expenses</p>
                    <p className="text-2xl text-white mt-1">${totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-400/20">
                    <p className="text-blue-200 text-sm">Number of Expenses</p>
                    <p className="text-2xl text-white mt-1">{filteredExpenses.length}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white mb-3">Balances:</h4>
                  {Object.entries(balances).filter(([_, balance]) => balance !== 0).length === 0 ? (
                    <p className="text-blue-300/50 text-center py-4">All settled up! 🎉</p>
                  ) : (
                    Object.entries(balances).map(([person, balance]) => (
                      balance !== 0 && (
                        <div key={person} className="flex justify-between items-center p-4 rounded-lg bg-white/5 border border-blue-400/10">
                          <span className="text-white">{person}</span>
                          <span className={`font-medium ${balance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {balance > 0 ? `Gets $${balance.toFixed(2)}` : `Owes $${Math.abs(balance).toFixed(2)}`}
                          </span>
                        </div>
                      )
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GROUPS TAB */}
          <TabsContent value="groups" className="space-y-6 mt-6">
            {/* Create New Group */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Group name (e.g., Weekend Trip, Office Lunch)"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="bg-white/5 border-blue-400/30 text-white placeholder:text-blue-300/50"
                />
                
                <div className="space-y-2">
                  <label className="text-blue-200">Select Members ({newGroup.selectedMembers.length}):</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mockFriends.map(friend => (
                      <div
                        key={friend}
                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                          friend === 'You' 
                            ? 'bg-blue-600/30 cursor-not-allowed' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => friend !== 'You' && toggleGroupMember(friend)}
                      >
                        <Checkbox
                          checked={newGroup.selectedMembers.includes(friend)}
                          disabled={friend === 'You'}
                          className="border-blue-400"
                        />
                        <span className="text-sm text-white">{friend}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={createGroup}
                  disabled={!newGroup.name || newGroup.selectedMembers.length < 2}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-0"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Groups List */}
            <Card className="bg-white/5 backdrop-blur-md border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white">Your Groups ({groups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.length === 0 ? (
                    <p className="text-blue-300/50 text-center py-8">
                      No groups yet. Create your first group above!
                    </p>
                  ) : (
                    groups.map((group) => {
                      const groupExpenses = expenses.filter(exp => exp.groupId === group.id);
                      const groupTotal = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                      
                      return (
                        <div key={group.id} className="p-4 rounded-lg bg-white/5 border border-blue-400/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white text-lg">{group.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span className="text-blue-200 text-sm">
                                  {group.members.length} members
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-blue-200 text-sm">Total Expenses</p>
                                <p className="text-white">${groupTotal.toFixed(2)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGroup(group.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.members.map(member => (
                              <span 
                                key={member}
                                className="px-2 py-1 bg-blue-600/20 border border-blue-400/30 rounded text-blue-200 text-xs"
                              >
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
