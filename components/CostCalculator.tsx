import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Member } from '~backend/members/types';
import type { CostItem, CalculateResponse } from '~backend/calculator/types';

export function CostCalculator() {
  const [costs, setCosts] = useState<CostItem[]>([
    { name: 'Chi phí sân', amount: 0 },
    { name: 'Chi phí cầu', amount: 0 },
    { name: 'Chi phí nước', amount: 0 }
  ]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [calculation, setCalculation] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

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

  const addCostItem = () => {
    setCosts([...costs, { name: '', amount: 0 }]);
  };

  const removeCostItem = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index));
  };

  const updateCostItem = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updatedCosts = costs.map((cost, i) => 
      i === index ? { ...cost, [field]: value } : cost
    );
    setCosts(updatedCosts);
  };

  const togglePlayer = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleCalculate = async () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một người chơi',
        variant: 'destructive',
      });
      return;
    }

    const validCosts = costs.filter(cost => cost.name.trim() && cost.amount > 0);
    if (validCosts.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập ít nhất một khoản chi phí',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.calculator.calculate({
        costs: validCosts,
        playerIds: selectedPlayers
      });
      setCalculation(response);
    } catch (error) {
      console.error('Error calculating costs:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tính toán chi phí',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Máy tính chia tiền</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {costs.map((cost, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Tên chi phí"
                    value={cost.name}
                    onChange={(e) => updateCostItem(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cost.amount || ''}
                    onChange={(e) => updateCostItem(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCostItem(index)}
                  disabled={costs.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" onClick={addCostItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chi phí
            </Button>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng chi phí:</span>
                <span className="text-lg font-bold text-primary">
                  {totalCost.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Người chơi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`player-${member.id}`}
                    checked={selectedPlayers.includes(member.id)}
                    onCheckedChange={() => togglePlayer(member.id)}
                  />
                  <Label 
                    htmlFor={`player-${member.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedPlayers.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Đã chọn {selectedPlayers.length} người
                </p>
                {totalCost > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chi phí mỗi người: {(totalCost / selectedPlayers.length).toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleCalculate} disabled={loading} size="lg">
          {loading ? 'Đang tính toán...' : 'Tính toán chi phí'}
        </Button>
      </div>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả tính toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tổng chi phí</p>
                <p className="text-2xl font-bold text-primary">
                  {calculation.totalCost.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Số người chơi</p>
                <p className="text-2xl font-bold">{calculation.totalPlayers}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Chi phí/người</p>
                <p className="text-2xl font-bold text-green-600">
                  {calculation.costPerPlayer.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Chi tiết chi phí cho từng người:
              </h4>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {calculation.playerCosts.map((playerCost) => (
                  <div
                    key={playerCost.playerId}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{playerCost.playerName}</span>
                    <Badge variant="secondary">
                      {playerCost.cost.toLocaleString('vi-VN')}đ
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
