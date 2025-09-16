import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Clock, MapPin, Users, DollarSign, FileText } from 'lucide-react';
import type { SessionWithParticipants } from '~backend/sessions/types';

interface SessionDetailProps {
  session: SessionWithParticipants;
  onBack: () => void;
  onEdit: () => void;
}

export function SessionDetail({ session, onBack, onEdit }: SessionDetailProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
  };

  const costPerPerson = session.participants.length > 0 ? session.totalCost / session.participants.length : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">Chi tiết buổi đánh</h2>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Thông tin buổi đánh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tên sân</p>
              <p className="font-medium text-lg">{session.courtName}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Ngày đánh</p>
              <p className="font-medium">{formatDate(session.sessionDate)}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Giờ bắt đầu</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(session.startTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giờ kết thúc</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(session.endTime)}
                </p>
              </div>
            </div>

            {session.shuttlecockCount > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Số quả cầu sử dụng</p>
                <Badge variant="outline" className="mt-1">
                  {session.shuttlecockCount} quả cầu
                </Badge>
              </div>
            )}

            {session.notes && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <FileText className="w-4 h-4" />
                  Ghi chú
                </p>
                <p className="text-sm bg-muted p-3 rounded-lg">{session.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {session.courtCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chi phí sân:</span>
                  <span className="font-medium">{session.courtCost.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {session.shuttlecockCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chi phí cầu:</span>
                  <span className="font-medium">{session.shuttlecockCost.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {session.waterCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chi phí nước:</span>
                  <span className="font-medium">{session.waterCost.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {session.otherCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chi phí khác:</span>
                  <span className="font-medium">{session.otherCost.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Tổng chi phí:</span>
                <span className="text-lg font-bold text-primary">
                  {session.totalCost.toLocaleString('vi-VN')}đ
                </span>
              </div>
              {session.participants.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Chi phí mỗi người:</span>
                  <span className="font-medium">
                    {costPerPerson.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Người tham gia ({session.participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session.participants.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {session.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="font-medium">{participant.memberName}</span>
                  <span className="text-sm text-muted-foreground">
                    {costPerPerson.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Chưa có người tham gia nào
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
