type Props = { icon: string; label: string; onOpen: () => void }

export function DesktopIcon({ icon, label, onOpen }: Props) {
  return (
    <button className="desktop-icon" onDoubleClick={onOpen} onClick={(event) => event.currentTarget.focus()}>
      <span>{icon}</span><b>{label}</b>
    </button>
  )
}
