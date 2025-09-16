import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { SessionWithParticipants, CreateSessionRequest, UpdateSessionRequest } from '~backend/sessions/types';
import type { Member } from '~backend/members/types';

interface SessionFormProps {
  title: string;
  session?: SessionWithParticipants;
  onBack: () => void;
  onSuccess: () => void;
}

export function SessionForm({ title, session, onBack, onSuccess }: SessionFormProps) {
  const [formData, setFormData] = useState({
    courtName: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    shuttlecockCount: '',
    courtCost: '',
    shuttlecockCost: '',
    waterCost: '',
    otherCost: '',
    notes: '',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    if (session) {
      setFormData({
        courtName: session.courtName || '',
        sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '',
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        shuttlecockCount: session.shuttlecockCount?.toString() || '',
        courtCost: session.courtCost?.toString() || '',
        shuttlecockCost: session.shuttlecockCost?.toString() || '',
        waterCost: session.waterCost?.toString() || '',
        otherCost: session.otherCost?.toString() || '',
        notes: session.notes || '',
      });
      setSelectedParticipants(session.participants.map(p => p.memberId));
    }
  }, [session]);

  const loadMembers = async () => {
    try {
      const response = await backend.members.list();
      setMembers(response.members);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách thành viên',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courtName.trim() || !formData.sessionDate || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    if (selectedParticipants.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một người tham gia',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (session) {
        // Update existing session
        const updateData: UpdateSessionRequest = {
          id: session.id,
          courtName: formData.courtName.trim(),
          sessionDate: new Date(formData.sessionDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          shuttlecockCount: formData.shuttlecockCount ? parseInt(formData.shuttlecockCount) : 0,
          courtCost: formData.courtCost ? parseFloat(formData.courtCost) : 0,
          shuttlecockCost: formData.shuttlecockCost ? parseFloat(formData.shuttlecockCost) : 0,
          waterCost: formData.waterCost ? parseFloat(formData.waterCost) : 0,
          otherCost: formData.otherCost ? parseFloat(formData.otherCost) : 0,
          notes: formData.notes.trim() || undefined,
          participantIds: selectedParticipants,
        };
        await backend.sessions.update(updateData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật buổi đánh thành công',
        });
      } else {
        // Create new session
        const createData: CreateSessionRequest = {
          courtName: formData.courtName.trim(),
          sessionDate: new Date(formData.sessionDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          shuttlecockCount: formData.shuttlecockCount ? parseInt(formData.shuttlecockCount) : 0,
          courtCost: formData.courtCost ? parseFloat(formData.courtCost) : 0,
          shuttlecockCost: formData.shuttlecockCost ? parseFloat(formData.shuttlecockCost) : 0,
          waterCost: formData.waterCost ? parseFloat(formData.waterCost) : 0,
          otherCost: formData.otherCost ? parseFloat(formData.otherCost) : 0,
          notes: formData.notes.trim() || undefined,
          participantIds: selectedParticipants,
        };
        await backend.sessions.create(createData);
        toast({
          title: 'Thành công',
          description: 'Thêm buổi đánh mới thành công',
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: 'Lỗi',
        description: session ? 'Không thể cập nhật buổi đánh' : 'Không thể thêm buổi đánh mới',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantToggle = (memberId: number) => {
    setSelectedParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const totalCost = (parseFloat(formData.courtCost) || 0) + 
                   (parseFloat(formData.shuttlecockCost) || 0) + 
                   (parseFloat(formData.waterCost) || 0) + 
                   (parseFloat(formData.otherCost) || 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courtName">Tên sân *</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) => handleInputChange('courtName', e.target.value)}
                  placeholder="Nhập tên sân cầu lông"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDate">Ngày đánh *</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => handleInputChange('sessionDate', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Giờ bắt đầu *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Giờ kết thúc *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shuttlecockCount">Số quả cầu</Label>
                <Input
                  id="shuttlecockCount"
                  type="number"
                  min="0"
                  value={formData.shuttlecockCount}
                  onChange={(e) => handleInputChange('shuttlecockCount', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courtCost">Chi phí sân (VNĐ)</Label>
                <Input
                  id="courtCost"
                  type="number"
                  min="0"
                  value={formData.courtCost}
                  onChange={(e) => handleInputChange('courtCost', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shuttlecockCost">Chi phí cầu (VNĐ)</Label>
                <Input
                  id="shuttlecockCost"
                  type="number"
                  min="0"
                  value={formData.shuttlecockCost}
                  onChange={(e) => handleInputChange('shuttlecockCost', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterCost">Chi phí nước (VNĐ)</Label>
                <Input
                  id="waterCost"
                  type="number"
                  min="0"
                  value={formData.waterCost}
                  onChange={(e) => handleInputChange('waterCost', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherCost">Chi phí khác (VNĐ)</Label>
                <Input
                  id="otherCost"
                  type="number"
                  min="0"
                  value={formData.otherCost}
                  onChange={(e) => handleInputChange('otherCost', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng chi phí:</span>
                  <span className="text-lg font-bold text-primary">
                    {totalCost.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Người tham gia *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={selectedParticipants.includes(member.id)}
                    onCheckedChange={() => handleParticipantToggle(member.id)}
                  />
                  <Label 
                    htmlFor={`member-${member.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedParticipants.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Đã chọn {selectedParticipants.length} người
                </p>
                {totalCost > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chi phí mỗi người: {(totalCost / selectedParticipants.length).toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Đang xử lý...' : (session ? 'Cập nhật' : 'Thêm buổi đánh')}
          </Button>
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
