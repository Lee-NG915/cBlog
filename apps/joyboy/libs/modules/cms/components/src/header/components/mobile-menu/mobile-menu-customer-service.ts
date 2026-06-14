type CustomerServiceApiLike = {
  openChat(): Promise<void>;
};

type OpenMenuCustomerServiceChatOptions = {
  closeDrawer(): void;
  fallback(): void;
  getCustomerServiceApi(): Promise<CustomerServiceApiLike>;
};

export async function openMenuCustomerServiceChat({
  closeDrawer,
  fallback,
  getCustomerServiceApi,
}: OpenMenuCustomerServiceChatOptions): Promise<void> {
  closeDrawer();

  try {
    const api = await getCustomerServiceApi();
    await api.openChat();
  } catch {
    fallback();
  }
}
