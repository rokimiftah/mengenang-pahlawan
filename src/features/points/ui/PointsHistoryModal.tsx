// src/features/points/ui/PointsHistoryModal.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useMemo } from "react";

import { Badge, Group, Modal, Table, Text } from "@mantine/core";

import { PointsApi } from "@features/points";

function formatDT(ms: number) {
  const d = new Date(ms);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function PointsHistoryModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const rows = PointsApi.usePointsAwards({ limit: 20 });

  const totalEarned = useMemo(() => (rows ?? []).reduce((a: number, r: any) => a + (r.points || 0), 0), [rows]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Riwayat Poin</Text>}
      centered
      radius="lg"
      overlayProps={{ blur: 10, opacity: 10 }}
      size="lg"
      withCloseButton={false}
    >
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          Menampilkan {rows?.length ?? 0} aktivitas terakhir
        </Text>
        <Badge variant="gradient" gradient={{ from: "yellow", to: "orange" }}>
          +{totalEarned} poin baru-baru ini
        </Badge>
      </Group>

      <Table.ScrollContainer minWidth={560}>
        <Table striped highlightOnHover withRowBorders={false} verticalSpacing="xs" style={{ tableLayout: "auto" }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Waktu</Table.Th>
              <Table.Th>Pahlawan</Table.Th>
              <Table.Th style={{ width: 120, whiteSpace: "nowrap" }}>Status</Table.Th>
              <Table.Th ta="right">Poin</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(rows ?? []).map((r: any, i: number) => (
              <Table.Tr key={i}>
                <Table.Td>{formatDT(r.createdAt)}</Table.Td>
                <Table.Td>{r.heroName}</Table.Td>

                <Table.Td style={{ width: 120, whiteSpace: "nowrap" }}>
                  {r.practice ? (
                    <Badge
                      color="gray"
                      variant="light"
                      radius="sm"
                      size="sm"
                      styles={{
                        root: { whiteSpace: "nowrap" },
                      }}
                    >
                      Latihan
                    </Badge>
                  ) : (
                    <Badge color="yellow" variant="light" radius="md" size="md">
                      Berbobot
                    </Badge>
                  )}
                </Table.Td>

                <Table.Td ta="right">{r.points > 0 ? <Text fw={700}>+{r.points}</Text> : <Text c="dimmed">0</Text>}</Table.Td>
              </Table.Tr>
            ))}

            {(!rows || rows.length === 0) && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center">
                    Belum ada riwayat.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Modal>
  );
}
