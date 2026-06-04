import { useDeleteConti } from '@/domains/conti/hooks/use-conti';
import { useConfirmAction } from '@/hooks/use-confirm-action';

const DELETE_CONTI_CONFIRM_MESSAGE = '정말로 이 콘티를 삭제하시겠습니까?';

export function useContiActions() {
  const { confirmAction } = useConfirmAction();
  const { mutate: deleteContiMutate } = useDeleteConti();

  const handleDeleteConti = async (contiId: string) => {
    const canDelete = await confirmAction(DELETE_CONTI_CONFIRM_MESSAGE);
    if (!canDelete) return;

    deleteContiMutate(contiId);
  };

  return {
    handleDeleteConti,
  };
}
