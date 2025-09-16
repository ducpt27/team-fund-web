import { useState } from 'react';
import { MemberList } from './components/MemberList';
import { MemberForm } from './components/MemberForm';
import { MemberDetail } from './components/MemberDetail';
import { SessionList } from './components/SessionList';
import { SessionForm } from './components/SessionForm';
import { SessionDetail } from './components/SessionDetail';
import { FundList } from './components/FundList';
import { FundForm } from './components/FundForm';
import { CostCalculator } from './components/CostCalculator';
import { Navigation } from './components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import type { Member } from '~backend/members/types';
import type { SessionWithParticipants } from '~backend/sessions/types';
import type { FundContribution } from '~backend/funds/types';

type View = 'members' | 'sessions' | 'funds' | 'calculator';
type SubView = 'list' | 'create' | 'detail' | 'edit';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('members');
  const [subView, setSubView] = useState<SubView>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionWithParticipants | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<FundContribution | null>(null);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setSubView('list');
    setSelectedMember(null);
    setSelectedSession(null);
    setSelectedContribution(null);
  };

  const handleCreateMember = () => {
    setSubView('create');
    setSelectedMember(null);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setSubView('detail');
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setSubView('edit');
  };

  const handleCreateSession = () => {
    setSubView('create');
    setSelectedSession(null);
  };

  const handleViewSession = (session: SessionWithParticipants) => {
    setSelectedSession(session);
    setSubView('detail');
  };

  const handleEditSession = (session: SessionWithParticipants) => {
    setSelectedSession(session);
    setSubView('edit');
  };

  const handleCreateContribution = () => {
    setSubView('create');
    setSelectedContribution(null);
  };

  const handleEditContribution = (contribution: FundContribution) => {
    setSelectedContribution(contribution);
    setSubView('edit');
  };

  const handleBackToList = () => {
    setSubView('list');
    setSelectedMember(null);
    setSelectedSession(null);
    setSelectedContribution(null);
  };

  const renderContent = () => {
    if (currentView === 'calculator') {
      return <CostCalculator />;
    }

    if (currentView === 'members') {
      if (subView === 'list') {
        return (
          <MemberList
            onCreateMember={handleCreateMember}
            onViewMember={handleViewMember}
            onEditMember={handleEditMember}
          />
        );
      }
      if (subView === 'create') {
        return (
          <MemberForm
            title="Thêm thành viên mới"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
      if (subView === 'edit' && selectedMember) {
        return (
          <MemberForm
            title="Chỉnh sửa thành viên"
            member={selectedMember}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
      if (subView === 'detail' && selectedMember) {
        return (
          <MemberDetail
            member={selectedMember}
            onBack={handleBackToList}
            onEdit={() => handleEditMember(selectedMember)}
          />
        );
      }
    }

    if (currentView === 'sessions') {
      if (subView === 'list') {
        return (
          <SessionList
            onCreateSession={handleCreateSession}
            onViewSession={handleViewSession}
            onEditSession={handleEditSession}
          />
        );
      }
      if (subView === 'create') {
        return (
          <SessionForm
            title="Thêm buổi đánh mới"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
      if (subView === 'edit' && selectedSession) {
        return (
          <SessionForm
            title="Chỉnh sửa buổi đánh"
            session={selectedSession}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
      if (subView === 'detail' && selectedSession) {
        return (
          <SessionDetail
            session={selectedSession}
            onBack={handleBackToList}
            onEdit={() => handleEditSession(selectedSession)}
          />
        );
      }
    }

    if (currentView === 'funds') {
      if (subView === 'list') {
        return (
          <FundList
            onCreateContribution={handleCreateContribution}
            onEditContribution={handleEditContribution}
          />
        );
      }
      if (subView === 'create') {
        return (
          <FundForm
            title="Thêm giao dịch quỹ"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
      if (subView === 'edit' && selectedContribution) {
        return (
          <FundForm
            title="Chỉnh sửa giao dịch quỹ"
            contribution={selectedContribution}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quản lý đội cầu lông
          </h1>
          <p className="text-muted-foreground">
            Quản lý thành viên, lịch sử đánh cầu và quỹ đội
          </p>
        </header>

        <Navigation currentView={currentView} onViewChange={handleViewChange} />

        <main className="mt-6">
          {renderContent()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
