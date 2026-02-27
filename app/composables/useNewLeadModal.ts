export const useNewLeadModal = () => {
  const isOpen = useState("new-lead-modal-open", () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    open,
    close
  }
}
