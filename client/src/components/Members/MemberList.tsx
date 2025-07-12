import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { membersApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import MemberCard from './MemberCard';
import MemberForm from './MemberForm';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';
import Modal from '../UI/Modal';
import { Plus, Search } from 'lucide-react';

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await membersApi.getAll();
      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        setError(response.error || 'Failed to load members');
      }
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    try {
      const response = await membersApi.create(memberData);
      if (response.success && response.data) {
        setMembers([...members, response.data]);
        setShowAddForm(false);
      } else {
        setError(response.error || 'Failed to add member');
      }
    } catch (err) {
      setError('Failed to add member');
    }
  };

  const handleUpdateMember = async (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    if (!editingMember) return;
    
    try {
      const response = await membersApi.update(editingMember.id, memberData);
      if (response.success && response.data) {
        setMembers(members.map(member => 
          member.id === editingMember.id ? response.data! : member
        ));
        setEditingMember(null);
      } else {
        setError(response.error || 'Failed to update member');
      }
    } catch (err) {
      setError('Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const response = await membersApi.delete(memberId);
      if (response.success) {
        setMembers(members.filter(member => member.id !== memberId));
      } else {
        setError(response.error || 'Failed to delete member');
      }
    } catch (err) {
      setError('Failed to delete member');
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageMembers = user?.role === 'admin' || user?.role === 'librarian';

  if (!canManageMembers) {
    return (
      <div className="text-center py-12">
        <Alert type="warning" message="You don't have permission to view members" />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name, email, or membership ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={setEditingMember}
            onDelete={handleDeleteMember}
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No members found</p>
        </div>
      )}

      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Member"
        size="lg"
      >
        <MemberForm
          onSubmit={handleAddMember}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Member"
        size="lg"
      >
        {editingMember && (
          <MemberForm
            member={editingMember}
            onSubmit={handleUpdateMember}
            onCancel={() => setEditingMember(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MemberList;