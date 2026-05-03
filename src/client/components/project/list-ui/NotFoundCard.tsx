import { Button } from '@/client/components/template/ui/button';

type Props = {
    message: string;
    onBack: () => void;
    backLabel?: string;
};

export function NotFoundCard({ message, onBack, backLabel = 'Back to lists' }: Props) {
    return (
        <div className="mx-auto w-full max-w-md px-5 py-12 text-center text-muted-foreground">
            {message}
            <div className="mt-4">
                <Button variant="outline" onClick={onBack}>
                    {backLabel}
                </Button>
            </div>
        </div>
    );
}
