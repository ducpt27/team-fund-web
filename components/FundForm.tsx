import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { FundContribution, CreateContributionRequest, UpdateContributionRequest } from '~backend/funds/types';
import type { Member } from '~backend/members/types';

interface FundFormProps {
  title: string;
  contribution?: FundContribution;
  onBack: () => void;
  onSuccess: () => void;
}

export function FundForm({ title, contribution, onBack, onSuccess }: FundFormProps) {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    contributionDate: '',
    contributionType: 'deposit',
    description: '',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    if (contribution) {
      setFormData({
        memberId: contribution.memberId.toString(),
        amount: contribution.amount.toString(),
        contributionDate: contribution.contributionDate ? new Date(contribution.contributionDate).toISOString().split('T')[0] : '',
        contributionType: contribution.contributionType,
        description: contribution.description || '',
      });
    }
  }, [contribution]);

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
    
    if (!formData.memberId || !formData.amount || !formData.contributionDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Lỗi',
        description: 'Số tiền phải là một số dương',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (contribution) {
        // Update existing contribution
        const updateData: UpdateContributionRequest = {
          id: contribution.id,
          memberId: parseInt(formData.memberId),
          amount,
          contributionDate: new Date(formData.contributionDate),
          contributionType: formData.contributionType as any,
          description: formData.description.trim() || undefined,
        };
        await backend.funds.update(updateData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật giao dịch thành công',
        });
      } else {
        // Create new contribution
        const createData: CreateContributionRequest = {
          memberId: parseInt(formData.memberId),
          amount,
          contributionDate: new Date(formData.contributionDate),
          contributionType: formData.contributionType as any,
          description: formData.description.trim() || undefined,
        };
        await backend.funds.create(createData);
        toast({
          title: 'Thành công',
          description: 'Thêm giao dịch mới thành công',
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving contribution:', error);
      toast({
        title: 'Lỗi',
        description: contribution ? 'Không thể cập nhật giao dịch' : 'Không thể thêm giao dịch mới',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedMemberName = () => {
    if (!formData.memberId) return "Chọn thành viên";
    const member = members.find(m => m.id.toString() === formData.memberId);
    return member ? member.name : "Chọn thành viên";
  };

  const getContributionTypeLabel = (value: string) => {
    const labels: Record<string, string> = {
      deposit: 'Nộp tiền',
      withdrawal: 'Rút tiền',
      session_payment: 'Thanh toán buổi đánh',
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
          <CardTitle>Thông tin giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="memberId">Thành viên *</Label>
                <Select value={formData.memberId} onValueChange={(value) => handleInputChange('memberId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành viên">
                      {getSelectedMemberName()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributionType">Loại giao dịch *</Label>
                <Select value={formData.contributionType} onValueChange={(value) => handleInputChange('contributionType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giao dịch">
                      {getContributionTypeLabel(formData.contributionType)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Nộp tiền</SelectItem>
                    <SelectItem value="withdrawal">Rút tiền</SelectItem>
                    <SelectItem value="session_payment">Thanh toán buổi đánh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền (VNĐ) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Nhập số tiền"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributionDate">Ngày giao dịch *</Label>
                <Input
                  id="contributionDate"
                  type="date"
                  value={formData.contributionDate}
                  onChange={(e) => handleInputChange('contributionDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả giao dịch (tùy chọn)"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang xử lý...' : (contribution ? 'Cập nhật' : 'Thêm giao dịch')}
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
