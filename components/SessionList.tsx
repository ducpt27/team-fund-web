import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { SessionWithParticipants } from '~backend/sessions/types';

interface SessionListProps {
  onCreateSession: () => void;
  onViewSession: (session: SessionWithParticipants) => void;
  onEditSession: (session: SessionWithParticipants) => void;
}

export function SessionList({ onCreateSession, onViewSession, onEditSession }: SessionListProps) {
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionWithParticipants[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const filtered = sessions.filter(session =>
      session.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSessions(filtered);
  }, [sessions, searchTerm]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await backend.sessions.list();
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách buổi đánh',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (session: SessionWithParticipants) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa buổi đánh tại ${session.courtName}?`)) {
      return;
    }

    try {
      await backend.sessions.deleteSession({ id: session.id });
      toast({
        title: 'Thành công',
        description: 'Đã xóa buổi đánh',
      });
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa buổi đánh',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
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
            placeholder="Tìm kiếm theo tên sân hoặc ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateSession} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Thêm buổi đánh
        </Button>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-center">
              {sessions.length === 0 ? (
                <>
                  <p className="mb-4">Chưa có buổi đánh nào được ghi nhận</p>
                  <Button onClick={onCreateSession}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm buổi đánh đầu tiên
                  </Button>
                </>
              ) : (
                <p>Không tìm thấy buổi đánh nào phù hợp</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {session.courtName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.sessionDate)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {session.participants.length} người
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {session.totalCost.toLocaleString('vi-VN')}đ
                  </Badge>
                  {session.shuttlecockCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {session.shuttlecockCount} quả cầu
                    </Badge>
                  )}
                </div>

                {session.participants.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Người tham gia:</p>
                    <p className="truncate">
                      {session.participants.map(p => p.memberName).join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSession(session)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSession(session)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSession(session)}
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
