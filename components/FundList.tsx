import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { FundContribution, MemberBalance } from '~backend/funds/types';

interface FundListProps {
  onCreateContribution: () => void;
  onEditContribution: (contribution: FundContribution) => void;
}

export function FundList({ onCreateContribution, onEditContribution }: FundListProps) {
  const [contributions, setContributions] = useState<FundContribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<FundContribution[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [totalFundBalance, setTotalFundBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = contributions.filter(contribution =>
      (contribution.memberName && contribution.memberName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contribution.description && contribution.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredContributions(filtered);
  }, [contributions, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contributionsResponse, balancesResponse] = await Promise.all([
        backend.funds.list(),
        backend.funds.getBalances()
      ]);
      setContributions(contributionsResponse.contributions);
      setBalances(balancesResponse.balances);
      setTotalFundBalance(balancesResponse.totalFundBalance);
    } catch (error) {
      console.error('Error loading fund data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu quỹ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContribution = async (contribution: FundContribution) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa giao dịch này?`)) {
      return;
    }

    try {
      await backend.funds.deleteContribution({ id: contribution.id });
      toast({
        title: 'Thành công',
        description: 'Đã xóa giao dịch',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting contribution:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa giao dịch',
        variant: 'destructive',
      });
    }
  };

  const getContributionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Nộp tiền',
      withdrawal: 'Rút tiền',
      session_payment: 'Thanh toán buổi đánh',
    };
    return labels[type] || type;
  };

  const getContributionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'session_payment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
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
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateContribution} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Thêm giao dịch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng quỹ</p>
                <p className="text-2xl font-bold text-primary">
                  {totalFundBalance.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thành viên có quỹ</p>
                <p className="text-2xl font-bold">
                  {balances.filter(b => b.currentBalance > 0).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giao dịch tháng này</p>
                <p className="text-2xl font-bold">
                  {contributions.filter(c => {
                    const contributionDate = new Date(c.contributionDate);
                    const now = new Date();
                    return contributionDate.getMonth() === now.getMonth() && 
                           contributionDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="balances">Số dư</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {filteredContributions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-muted-foreground text-center">
                  {contributions.length === 0 ? (
                    <>
                      <p className="mb-4">Chưa có giao dịch nào</p>
                      <Button onClick={onCreateContribution}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm giao dịch đầu tiên
                      </Button>
                    </>
                  ) : (
                    <p>Không tìm thấy giao dịch nào phù hợp</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredContributions.map((contribution) => (
                <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{contribution.memberName}</h3>
                          <Badge className={`text-xs ${getContributionTypeColor(contribution.contributionType)}`}>
                            {getContributionTypeLabel(contribution.contributionType)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {formatDate(contribution.contributionDate)}
                        </p>
                        {contribution.description && (
                          <p className="text-sm text-muted-foreground">
                            {contribution.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            contribution.contributionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {contribution.contributionType === 'deposit' ? '+' : '-'}
                            {contribution.amount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditContribution(contribution)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContribution(contribution)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          {balances.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Chưa có thành viên nào có giao dịch quỹ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {balances.map((balance) => (
                <Card key={balance.memberId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{balance.memberName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng nộp:</span>
                        <span className="text-green-600 font-medium">
                          +{balance.totalDeposits.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng rút:</span>
                        <span className="text-red-600 font-medium">
                          -{balance.totalWithdrawals.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thanh toán:</span>
                        <span className="text-blue-600 font-medium">
                          -{balance.totalSessionPayments.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Số dư hiện tại:</span>
                        <span className={`text-lg font-bold ${
                          balance.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {balance.currentBalance.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
