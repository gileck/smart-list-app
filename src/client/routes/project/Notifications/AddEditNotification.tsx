import { useMemo, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { toast } from '@/client/components/template/ui/toast';
import {
    useAvailableChannels,
    useCreateNotificationWithId,
    useLists,
    useNotifications,
    useRouter,
    useSendNotificationTest,
    useUpdateNotification,
    type CreateNotificationInput,
    type NotificationChannel,
    type NotificationFrequency,
} from '@/client/features';
import { NotFoundCard, RoundIconButton } from '@/client/components/project/list-ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/client/components/template/ui/select';

type Props = { mode: 'add' | 'edit' };

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

function formatHour(h: number): string {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${period}`;
}

function getDefaultTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

export function AddEditNotification({ mode }: Props) {
    const { navigate, routeParams } = useRouter();
    const isEdit = mode === 'edit';
    const notificationId = isEdit ? routeParams.notificationId : null;

    const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();
    const { data: listsData, isLoading: listsLoading } = useLists();
    const { data: channelsData } = useAvailableChannels();
    const createMutation = useCreateNotificationWithId();
    const updateMutation = useUpdateNotification();
    const sendTestMutation = useSendNotificationTest();

    const editConfig = notificationId
        ? notificationsData?.notifications?.find((n) => n.id === notificationId) ?? null
        : null;

    const lists = listsData?.lists ?? [];

    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [name, setName] = useState(editConfig?.name ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [listId, setListId] = useState(editConfig?.listId ?? lists[0]?.id ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [frequency, setFrequency] = useState<NotificationFrequency>(
        editConfig?.schedule.frequency ?? 'daily'
    );
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [hourOfDay, setHourOfDay] = useState<number>(editConfig?.schedule.hourOfDay ?? 20);
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
        editConfig?.schedule.daysOfWeek ?? [1]
    );
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [daysThreshold, setDaysThreshold] = useState<string>(
        String(editConfig?.filter.daysThreshold ?? 3)
    );
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [channels, setChannels] = useState<NotificationChannel[]>(
        editConfig?.channels ?? []
    );
    // eslint-disable-next-line state-management/prefer-state-architecture -- form state
    const [enabled, setEnabled] = useState<boolean>(editConfig?.enabled ?? true);

    const selectedList = lists.find((l) => l.id === listId) ?? null;
    const filterType =
        selectedList?.type === 'chore' ? 'chore_due_within' : 'shopping_below_days';

    const availableChannels = useMemo<NotificationChannel[]>(() => {
        const out: NotificationChannel[] = [];
        if (channelsData?.push) out.push('push');
        if (channelsData?.telegram) out.push('telegram');
        return out;
    }, [channelsData]);

    const parsedThreshold = parseInt(daysThreshold, 10);
    const validThreshold = !Number.isNaN(parsedThreshold) && parsedThreshold >= 0;

    const canSave =
        !!listId &&
        validThreshold &&
        channels.length > 0 &&
        (frequency === 'daily' || daysOfWeek.length > 0);

    const goBack = () => navigate('/notifications');

    const buildPayload = (): CreateNotificationInput => ({
        listId,
        name: name.trim() || undefined,
        schedule: {
            frequency,
            hourOfDay,
            timezone: editConfig?.schedule.timezone ?? getDefaultTimezone(),
            daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
        },
        filter: {
            type: filterType,
            daysThreshold: parsedThreshold,
        },
        channels,
        enabled,
    });

    const handleSave = () => {
        if (!canSave) return;
        const payload = buildPayload();

        if (isEdit && editConfig) {
            updateMutation.mutate(
                {
                    notificationId: editConfig.id,
                    name: payload.name,
                    schedule: payload.schedule,
                    filter: payload.filter,
                    channels: payload.channels,
                    enabled: payload.enabled,
                },
                {
                    onSuccess: () => {
                        toast.success('Notification updated');
                        goBack();
                    },
                    onError: (err) =>
                        toast.error(
                            err instanceof Error ? err.message : 'Failed to update'
                        ),
                }
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                toast.success('Notification created');
                goBack();
            },
            onError: (err) =>
                toast.error(err instanceof Error ? err.message : 'Failed to create'),
        });
    };

    const canSendTest =
        !!listId && validThreshold && channels.length > 0;

    const handleSendTest = () => {
        if (!canSendTest) return;
        sendTestMutation.mutate(
            {
                listId,
                filter: { type: filterType, daysThreshold: parsedThreshold },
                channels,
            },
            {
                onSuccess: (data) => {
                    if (data?.sent) {
                        toast.success(
                            `Test sent via ${data.channels?.join(', ') ?? 'channel(s)'}`
                        );
                    } else {
                        toast.info('Test sent — no channels delivered');
                    }
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Send failed'),
            }
        );
    };

    if (isEdit && !editConfig && !notificationsLoading) {
        return (
            <NotFoundCard
                message="Notification not found."
                onBack={() => navigate('/notifications')}
                backLabel="Back"
            />
        );
    }

    if (!isEdit && lists.length === 0 && !listsLoading) {
        return (
            <NotFoundCard
                message="Create a list first."
                onBack={() => navigate('/')}
                backLabel="Go to lists"
            />
        );
    }

    const toggleDay = (d: number) =>
        setDaysOfWeek((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
        );
    const toggleChannel = (c: NotificationChannel) =>
        setChannels((prev) =>
            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
        );

    const filterLabel =
        selectedList?.type === 'chore'
            ? 'Show chores due within'
            : 'Show items with at most';
    const filterUnit =
        selectedList?.type === 'chore' ? 'days (incl. overdue)' : 'days left';

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back" onClick={goBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <h1 className="flex-1 text-[17px] font-semibold tracking-tight">
                        {isEdit ? 'Edit Notification' : 'New Notification'}
                    </h1>
                </header>

                <div className="border-t border-border pt-2 pb-6">
                    <Field label="Name (optional)">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Evening shopping check"
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-base outline-none transition-colors focus:border-foreground"
                        />
                    </Field>

                    <Field label="List">
                        <Select
                            value={listId || undefined}
                            onValueChange={setListId}
                            disabled={isEdit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="— pick a list —" />
                            </SelectTrigger>
                            <SelectContent>
                                {lists.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.name}{' '}
                                        <span className="text-muted-foreground">
                                            ({l.type})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isEdit && (
                            <p className="text-[12px] text-muted-foreground">
                                List can&apos;t be changed after creation.
                            </p>
                        )}
                    </Field>

                    <Field label="Frequency">
                        <div className="flex gap-2">
                            {(['daily', 'weekly'] as const).map((f) => (
                                <button
                                    type="button"
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                        frequency === f
                                            ? 'border-foreground bg-muted/60'
                                            : 'border-border hover:bg-muted/40'
                                    }`}
                                >
                                    {f === 'daily' ? 'Daily' : 'Weekly'}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {frequency === 'weekly' && (
                        <Field label="Days of the week">
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((d) => {
                                    const on = daysOfWeek.includes(d.value);
                                    return (
                                        <button
                                            type="button"
                                            key={d.value}
                                            onClick={() => toggleDay(d.value)}
                                            className={`h-10 min-w-12 rounded-lg border px-3 text-sm font-medium transition-colors ${
                                                on
                                                    ? 'border-foreground bg-muted/60'
                                                    : 'border-border hover:bg-muted/40'
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                    )}

                    <Field label="Time">
                        <Select
                            value={String(hourOfDay)}
                            onValueChange={(v) => setHourOfDay(parseInt(v, 10))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {HOURS.map((h) => (
                                    <SelectItem key={h} value={String(h)}>
                                        {formatHour(h)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label={filterLabel}>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={daysThreshold}
                                onChange={(e) => setDaysThreshold(e.target.value)}
                                className="h-10 w-24 rounded-lg border border-border bg-background px-3 text-center text-base outline-none transition-colors focus:border-foreground"
                            />
                            <span className="text-sm text-muted-foreground">
                                {filterUnit}
                            </span>
                        </div>
                    </Field>

                    <Field label="Send via">
                        {availableChannels.length === 0 ? (
                            <p className="text-[13px] italic text-muted-foreground/70">
                                No channels configured. Enable Push notifications in
                                Settings or set up Telegram first.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {availableChannels.map((c) => {
                                    const on = channels.includes(c);
                                    return (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => toggleChannel(c)}
                                            className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                                                on
                                                    ? 'border-foreground bg-muted/60'
                                                    : 'border-border hover:bg-muted/40'
                                            }`}
                                        >
                                            <span className="text-[15px] font-medium capitalize">
                                                {c}
                                            </span>
                                            <span
                                                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                                    on
                                                        ? 'border-foreground bg-foreground'
                                                        : 'border-border'
                                                }`}
                                            >
                                                {on && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-background" />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Field>

                    <Field label="Status">
                        <button
                            type="button"
                            onClick={() => setEnabled(!enabled)}
                            className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                                enabled
                                    ? 'border-success/40 bg-success/5'
                                    : 'border-border bg-muted/30'
                            }`}
                        >
                            <span className="text-[15px] font-medium">
                                {enabled ? 'Active' : 'Paused'}
                            </span>
                            <span className="text-[12px] text-muted-foreground">
                                {enabled
                                    ? 'Will fire on schedule'
                                    : 'Won’t fire until re-enabled'}
                            </span>
                        </button>
                    </Field>

                    <div className="mt-6 h-px bg-border" />

                    <div className="flex flex-col gap-2.5 px-5 pt-6">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={!canSave}
                            className="w-full"
                        >
                            {isEdit ? 'Save Changes' : 'Create Notification'}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleSendTest}
                            disabled={!canSendTest || sendTestMutation.isPending}
                            className="w-full"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {sendTestMutation.isPending ? 'Sending…' : 'Send test now'}
                        </Button>
                        <Button variant="outline" size="lg" onClick={goBack} className="w-full">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5 px-5 pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </span>
            {children}
        </div>
    );
}
