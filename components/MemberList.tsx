import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Member } from '~backend/members/types';

interface MemberListProps {
  onCreateMember: () => void;
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
}

export function MemberList({ onCreateMember, onViewMember, onEditMember }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm))
    );
    setFilteredMembers(filtered);
  }, [members, searchTerm]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await backend.members.list();
      setMembers(response.members);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách thành viên',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên ${member.name}?`)) {
      return;
    }

    try {
      await backend.members.deleteMember({ id: member.id });
      toast({
        title: 'Thành công',
        description: `Đã xóa thành viên ${member.name}`,
      });
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa thành viên',
        variant: 'destructive',
      });
    }
  };

  const getSkillLevelLabel = (skillLevel?: string) => {
    const labels: Record<string, string> = {
      beginner: 'Mới bắt đầu',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao',
      expert: 'Chuyên gia',
    };
    return skillLevel ? labels[skillLevel] || skillLevel : '';
  };

  const getPositionLabel = (position?: string) => {
    const labels: Record<string, string> = {
      singles: 'Đơn',
      doubles: 'Đôi',
      both: 'Cả hai',
    };
    return position ? labels[position] || position : '';
  };

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };
    return gender ? labels[gender] || gender : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateMember} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Thêm thành viên
        </Button>
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-center">
              {members.length === 0 ? (
                <>
                  <p className="mb-4">Chưa có thành viên nào trong đội</p>
                  <Button onClick={onCreateMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm thành viên đầu tiên
                  </Button>
                </>
              ) : (
                <p>Không tìm thấy thành viên nào phù hợp</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                    {member.phone && (
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {member.skillLevel && (
                    <Badge variant="secondary" className="text-xs">
                      {getSkillLevelLabel(member.skillLevel)}
                    </Badge>
                  )}
                  {member.playingPosition && (
                    <Badge variant="outline" className="text-xs">
                      {getPositionLabel(member.playingPosition)}
                    </Badge>
                  )}
                  {member.gender && (
                    <Badge variant="outline" className="text-xs">
                      {getGenderLabel(member.gender)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewMember(member)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditMember(member)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
