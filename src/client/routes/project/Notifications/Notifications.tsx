import { useMemo, useState } from 'react';
import { Bell, MoreVertical, Pencil, Send, Trash2 } from 'lucide-react';
import {
    useDeleteNotification,
    useLists,
    useNotifications,
    useRouter,
    useSendNotificationNow,
    type NotificationConfigClient,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import { EmptyCard, Fab, RoundIconButton } from '@/client/components/project/list-ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/client/components/template/ui/dropdown-menu';

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHour(h: number): string {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display} ${period}`;
}

function formatSchedule(n: NotificationConfigClient): string {
    if (n.schedule.frequency === 'daily') {
        return `Daily at ${formatHour(n.schedule.hourOfDay)}`;
    }
    const days = n.schedule.daysOfWeek?.map((d) => DAY_LABEL[d]).join(', ') ?? '';
    return `Weekly (${days}) at ${formatHour(n.schedule.hourOfDay)}`;
}

function formatFilter(n: NotificationConfigClient): string {
    if (n.filter.type === 'shopping_below_days') {
        return `Items with ≤ ${n.filter.daysThreshold} day${n.filter.daysThreshold === 1 ? '' : 's'} left`;
    }
    if (n.filter.type === 'chore_due_within') {
        return `Chores due within ${n.filter.daysThreshold} day${n.filter.daysThreshold === 1 ? '' : 's'}`;
    }
    return n.filter.type;
}

export function Notifications() {
    const { navigate } = useRouter();
    const { data: notificationsData, isLoading } = useNotifications();
    const { data: listsData } = useLists();
    const deleteMutation = useDeleteNotification();
    const sendNowMutation = useSendNotificationNow();

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<NotificationConfigClient | null>(null);
    // eslint-disable-next-line state-management/prefer-state-architecture -- track in-flight test send
    const [sendingId, setSendingId] = useState<string | null>(null);

    const notifications = notificationsData?.notifications ?? [];
    const lists = listsData?.lists ?? [];
    const sorted = useMemo(
        () => [...notifications].sort((a, b) => a.created_at - b.created_at),
        [notifications]
    );

    const listName = (listId: string) =>
        lists.find((l) => l.id === listId)?.name ?? 'Unknown list';

    const handleDelete = () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        deleteMutation.mutate(
            { notificationId: target.id },
            {
                onSuccess: () => toast.success('Notification deleted'),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to delete'),
            }
        );
    };

    const handleSendNow = (n: NotificationConfigClient) => {
        setSendingId(n.id);
        sendNowMutation.mutate(
            { notificationId: n.id },
            {
                onSettled: () => setSendingId(null),
                onSuccess: (data) => {
                    if (data?.sent) {
                        toast.success(
                            `Sent via ${data.channels?.join(', ') ?? 'configured channel(s)'}`
                        );
                    } else {
                        toast.info('No active channels delivered the test message');
                    }
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to send'),
            }
        );
    };

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-2 px-5 pt-5 pb-4">
                    <h1 className="flex-1 text-[22px] font-semibold tracking-tight">
                        Notifications
                    </h1>
                    <span className="text-[13px] text-muted-foreground">
                        {notifications.length}
                    </span>
                </header>

                {isLoading && notifications.length === 0 ? (
                    <div className="border-t border-border px-5 py-12 text-center text-sm text-muted-foreground/70">
                        Loading…
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="border-t border-border">
                        <EmptyCard
                            title="No notifications yet"
                            hint="Tap + to set up a daily or weekly reminder."
                        />
                    </div>
                ) : (
                    <ul className="divide-y divide-border border-t border-border">
                        {sorted.map((n) => (
                            <li key={n.id}>
                                <NotificationCard
                                    notification={n}
                                    listName={listName(n.listId)}
                                    sending={sendingId === n.id}
                                    onEdit={() => navigate(`/notifications/${n.id}/edit`)}
                                    onDelete={() => setDeleteTarget(n)}
                                    onSendNow={() => handleSendNow(n)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Fab
                aria-label="Add notification"
                onClick={() => navigate('/notifications/new')}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete notification?"
                description="This notification config will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}

function NotificationCard({
    notification: n,
    listName,
    sending,
    onEdit,
    onDelete,
    onSendNow,
}: {
    notification: NotificationConfigClient;
    listName: string;
    sending: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onSendNow: () => void;
}) {
    return (
        <div className="flex items-start gap-3 px-4 py-3.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Bell className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-base font-medium tracking-tight">
                        {n.name?.trim() || listName}
                    </span>
                    {!n.enabled && (
                        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            paused
                        </span>
                    )}
                </div>
                <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {listName} · {formatSchedule(n)}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground/70">
                    {formatFilter(n)} · {n.channels.join(', ')}
                </p>
            </div>

            <div className="shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <RoundIconButton aria-label="Actions">
                            <MoreVertical className="h-4 w-4" />
                        </RoundIconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={onSendNow} disabled={sending}>
                            <Send className="mr-2 h-4 w-4" />
                            {sending ? 'Sending…' : 'Send now'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
