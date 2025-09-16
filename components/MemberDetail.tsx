import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, Calendar, User, Trophy, Target } from 'lucide-react';
import type { Member } from '~backend/members/types';

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
  onEdit: () => void;
}

export function MemberDetail({ member, onBack, onEdit }: MemberDetailProps) {
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

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">Thông tin thành viên</h2>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="text-2xl">
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{member.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {member.skillLevel && (
                  <Badge variant="secondary">
                    <Trophy className="w-3 h-3 mr-1" />
                    {getSkillLevelLabel(member.skillLevel)}
                  </Badge>
                )}
                {member.playingPosition && (
                  <Badge variant="outline">
                    <Target className="w-3 h-3 mr-1" />
                    {getPositionLabel(member.playingPosition)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {member.phone && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>
            )}

            {member.birthDate && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-medium">{formatDate(member.birthDate)}</p>
                </div>
              </div>
            )}

            {member.gender && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-medium">{getGenderLabel(member.gender)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ngày tham gia</p>
                <p className="font-medium">{formatDate(member.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(member.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
