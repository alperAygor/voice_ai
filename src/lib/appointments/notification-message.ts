export function buildAppointmentConfirmationMessage(input: {
  whenText: string;
  confirmUrl: string;
  cancelUrl: string;
}): string {
  return [
    `Randevunuz oluşturuldu: ${input.whenText}.`,
    `Onaylamak için: ${input.confirmUrl}`,
    `İptal için: ${input.cancelUrl}`,
  ].join("\n");
}
