"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Portal,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { toaster } from "../../components/ui/toaster";
import CreateReportModal from "./CreateReportModal";
import DMReportModal from "./DMReportModal";
import AuditReportModal from "./AuditReportModal";

type Report = {
  id: string;
  type: string;
  reportDate: string;
  content: any;
  createdAt: string;
  client?: { id: string; username: string };
  createdBy?: { id: string; username: string };
};

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editReport, setEditReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Report[]>("/reports");
      const sortedReports = res.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setReports(sortedReports);
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error fetching reports",
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (reportId: string) => {
    try {
      await axios.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toaster.create({ title: "Report deleted", type: "success" });
    } catch (err) {
      console.error(err);
      toaster.create({ title: "Failed to delete report", type: "error" });
    }
  };

  const renderEditModal = () => {
    if (!editReport) return null;

    const commonProps = {
      open: !!editReport,
      onOpenChange: (open: boolean) => !open && setEditReport(null),
      baseData: {
        id: editReport.id,
        type: editReport.type,
        clientId: editReport.client?.id || "",
        reportDate: editReport.reportDate,
        content: editReport.content,
      },
      onReportCreated: (updatedReport: Report) => {
        setReports((prev) =>
          prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)),
        );
        setEditReport(null);
      },
    };

    switch (editReport.type) {
      case "DM":
        return <DMReportModal {...commonProps} />;
      case "AUDIT":
        return <AuditReportModal {...commonProps} />;
      default:
        return null;
    }
  };
  const formatReportDate = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${month}/${day}/${year}`;
  };

  if (loading) {
    return (
      <Flex minH="50vh" align="center" justify="center" bg="bg">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.solid" />
          <Text color="fg.muted">Loading reports...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100dvh" bg="bg">
      <VStack align="stretch" gap={6}>
        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="sm"
          overflow="hidden"
        >
          <Box h="1.5" bg="brand.solid" />
          <Card.Body p={{ base: 5, md: 6 }}>
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "start", lg: "center" }}
              gap={5}
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="fg.subtle"
                  mb={2}
                >
                  Reports management
                </Text>

                <Heading size="xl" letterSpacing="-0.02em">
                  Dashboard
                </Heading>

                <Text mt={3} color="fg.muted" maxW="3xl" lineHeight="tall">
                  Create, review, edit, and remove reports workspace.
                </Text>
              </Box>

              <HStack gap={3} wrap="wrap">
                <Badge
                  variant="subtle"
                  colorPalette="brand"
                  rounded="full"
                  px="3"
                  py="1.5"
                >
                  {reports.length} report{reports.length === 1 ? "" : "s"}
                </Badge>

                <Button
                  colorPalette="brand"
                  size="lg"
                  rounded="xl"
                  onClick={() => setModalOpen(true)}
                >
                  Create New Report
                </Button>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>

        <CreateReportModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onReportCreated={(report) => setReports((prev) => [report, ...prev])}
        />

        {renderEditModal()}

        <Card.Root
          variant="outline"
          bg="bg.panel"
          borderColor="border"
          rounded="2xl"
          shadow="xs"
        >
          <Card.Body p={0}>
            {!reports.length ? (
              <Box px={{ base: 5, md: 6 }} py={{ base: 10, md: 12 }}>
                <VStack gap={2} textAlign="center">
                  <Heading size="md">No reports yet</Heading>
                  <Text color="fg.muted">
                    Create your first report to start populating this dashboard.
                  </Text>
                </VStack>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table.ScrollArea maxH="700px">
                  <Table.Root variant="line" size="sm" stickyHeader>
                    <Table.Header>
                      <Table.Row bg="bg.muted">
                        <Table.ColumnHeader color="fg.subtle">
                          Type
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Client
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Created By
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Report Date
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Created At
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.subtle">
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {reports.map((report, index) => (
                        <Table.Row
                          key={report.id}
                          bg={index % 2 === 1 ? "bg.subtle" : "transparent"}
                          _hover={{ bg: "bg.hover" }}
                          transition="background 0.16s ease"
                        >
                          <Table.Cell>
                            <Badge
                              variant="subtle"
                              colorPalette={
                                report.type === "AUDIT" ? "brand" : "green"
                              }
                              rounded="full"
                            >
                              {report.type}
                            </Badge>
                          </Table.Cell>

                          <Table.Cell>
                            {report.client?.username || "-"}
                          </Table.Cell>

                          <Table.Cell>
                            {report.createdBy?.username || "-"}
                          </Table.Cell>

                          <Table.Cell whiteSpace="nowrap">
                            {formatReportDate(report.reportDate)}
                          </Table.Cell>

                          <Table.Cell whiteSpace="nowrap">
                            {new Date(report.createdAt).toLocaleString()}
                          </Table.Cell>

                          <Table.Cell>
                            <HStack gap={2}>
                              <Button
                                colorPalette="brand"
                                variant="outline"
                                size="sm"
                                rounded="lg"
                                onClick={() => setEditReport(report)}
                              >
                                Edit
                              </Button>

                              <Dialog.Root role="alertdialog">
                                <Dialog.Trigger asChild>
                                  <Button
                                    colorPalette="red"
                                    variant="outline"
                                    size="sm"
                                    rounded="lg"
                                  >
                                    Delete
                                  </Button>
                                </Dialog.Trigger>

                                <Portal>
                                  <Dialog.Backdrop
                                    bg="blackAlpha.600"
                                    backdropFilter="blur(6px)"
                                  />
                                  <Dialog.Positioner px={4}>
                                    <Dialog.Content
                                      maxW="md"
                                      rounded="2xl"
                                      borderWidth="1px"
                                      borderColor="border"
                                      bg="bg.panel"
                                      shadow="2xl"
                                    >
                                      <Box
                                        h="1.5"
                                        bg="status.danger"
                                        borderTopRadius="inherit"
                                      />

                                      <Dialog.Header
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="start"
                                        px={6}
                                        pt={6}
                                        pb={3}
                                      >
                                        <Box>
                                          <Dialog.Title>
                                            Delete report
                                          </Dialog.Title>
                                          <Text
                                            mt={2}
                                            fontSize="sm"
                                            color="fg.muted"
                                          >
                                            This action cannot be undone.
                                          </Text>
                                        </Box>

                                        <Dialog.CloseTrigger asChild>
                                          <CloseButton size="sm" />
                                        </Dialog.CloseTrigger>
                                      </Dialog.Header>

                                      <Dialog.Body px={6} pb={4}>
                                        <Text
                                          color="fg.muted"
                                          lineHeight="tall"
                                        >
                                          This will permanently delete the
                                          report and remove its data from your
                                          system.
                                        </Text>
                                      </Dialog.Body>

                                      <Dialog.Footer px={6} pb={6} pt={0}>
                                        <Dialog.ActionTrigger asChild>
                                          <Button
                                            variant="outline"
                                            rounded="xl"
                                          >
                                            Cancel
                                          </Button>
                                        </Dialog.ActionTrigger>

                                        <Button
                                          colorPalette="red"
                                          rounded="xl"
                                          onClick={() =>
                                            handleDelete(report.id)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </Dialog.Footer>
                                    </Dialog.Content>
                                  </Dialog.Positioner>
                                </Portal>
                              </Dialog.Root>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>

                    <Table.Footer>
                      <Table.Row bg="bg.subtle">
                        <Table.Cell colSpan={6}>
                          <Text fontWeight="medium" color="fg.subtle">
                            Total Reports: {reports.length}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Footer>
                  </Table.Root>
                </Table.ScrollArea>
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default Dashboard;
