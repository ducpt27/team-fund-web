import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Member, CreateMemberRequest, UpdateMemberRequest } from '~backend/members/types';

interface MemberFormProps {
  title: string;
  member?: Member;
  onBack: () => void;
  onSuccess: () => void;
}

export function MemberForm({ title, member, onBack, onSuccess }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: '',
    skillLevel: '',
    playingPosition: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        phone: member.phone || '',
        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
        gender: member.gender || '',
        skillLevel: member.skillLevel || '',
        playingPosition: member.playingPosition || '',
        avatarUrl: member.avatarUrl || '',
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên thành viên là bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (member) {
        // Update existing member
        const updateData: UpdateMemberRequest = {
          id: member.id,
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
          gender: formData.gender as any || undefined,
          skillLevel: formData.skillLevel as any || undefined,
          playingPosition: formData.playingPosition as any || undefined,
          avatarUrl: formData.avatarUrl.trim() || undefined,
        };
        await backend.members.update(updateData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật thông tin thành viên thành công',
        });
      } else {
        // Create new member
        const createData: CreateMemberRequest = {
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
          gender: formData.gender as any || undefined,
          skillLevel: formData.skillLevel as any || undefined,
          playingPosition: formData.playingPosition as any || undefined,
          avatarUrl: formData.avatarUrl.trim() || undefined,
        };
        await backend.members.create(createData);
        toast({
          title: 'Thành công',
          description: 'Thêm thành viên mới thành công',
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: 'Lỗi',
        description: member ? 'Không thể cập nhật thông tin thành viên' : 'Không thể thêm thành viên mới',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getGenderLabel = (value: string) => {
    const labels: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    };
    return labels[value] || value;
  };

  const getSkillLevelLabel = (value: string) => {
    const labels: Record<string, string> = {
      beginner: 'Mới bắt đầu',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao',
      expert: 'Chuyên gia',
    };
    return labels[value] || value;
  };

  const getPositionLabel = (value: string) => {
    const labels: Record<string, string> = {
      singles: 'Đơn',
      doubles: 'Đôi',
      both: 'Cả hai',
    };
    return labels[value] || value;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thành viên</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên thành viên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên thành viên"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính">
                      {formData.gender ? getGenderLabel(formData.gender) : "Chọn giới tính"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel">Trình độ</Label>
                <Select value={formData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trình độ">
                      {formData.skillLevel ? getSkillLevelLabel(formData.skillLevel) : "Chọn trình độ"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Mới bắt đầu</SelectItem>
                    <SelectItem value="intermediate">Trung bình</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                    <SelectItem value="expert">Chuyên gia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playingPosition">Vị trí chơi</Label>
                <Select value={formData.playingPosition} onValueChange={(value) => handleInputChange('playingPosition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí chơi">
                      {formData.playingPosition ? getPositionLabel(formData.playingPosition) : "Chọn vị trí chơi"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles">Đơn</SelectItem>
                    <SelectItem value="doubles">Đôi</SelectItem>
                    <SelectItem value="both">Cả hai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Hình ảnh đại diện (URL)</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                placeholder="Nhập URL hình ảnh đại diện"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang xử lý...' : (member ? 'Cập nhật' : 'Thêm thành viên')}
              </Button>
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
