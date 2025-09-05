"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { EllipsisVerticalIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { ChangePasswordModal } from "~/components/dashboard/user/ChangePasswordModal";
import { CreateUserModal } from "~/components/dashboard/user/CreateUserModal";
import { DeleteUserModal } from "~/components/dashboard/user/DeleteUserModal";
import { Header } from "~/components/Header";
import { Spinner } from "~/components/Spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MainContainer } from "~/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { PAGE_SIZE } from "~/constants";
import { authClient } from "~/lib/auth-client";
import { UserWithRole } from "~/types/auth";

export default function UsersPage() {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const {
    data: users,
    status,
    refetch,
  } = useQuery({
    queryKey: ["listUsers"],
    queryFn: () =>
      authClient.admin.listUsers({
        query: {
          limit: PAGE_SIZE,
        },
      }),
  });

  return (
    <MainContainer>
      <Header>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
      </Header>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            등록된 모든 사용자 계정을 확인하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>사용자 유형</TableHead>
                <TableHead className="text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status === "pending" ? (
                <TableRow>
                  <TableCell colSpan={99} rowSpan={99}>
                    <div className="flex items-center justify-center p-6">
                      <Spinner className="size-6" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : status === "success" && users.data ? (
                users.data.users.map((user) => (
                  <UserTableRow key={user.id} user={user} refetch={refetch} />
                ))
              ) : (
                <p>{users?.error?.message}</p>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => setIsCreateUserModalOpen(true)}>
            <PlusIcon />
            유저 추가
          </Button>
        </CardFooter>
      </Card>

      <CreateUserModal
        open={isCreateUserModalOpen}
        setOpen={setIsCreateUserModalOpen}
        onSuccess={refetch}
      />
    </MainContainer>
  );
}

function UserTableRow({
  user,
  refetch,
}: {
  user: UserWithRole;
  refetch: () => void;
}) {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{format(user.createdAt, "yyyy-MM-dd HH:mm:ss")}</TableCell>
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role === "admin" ? "관리자" : "일반 사용자"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8">
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                비밀번호 변경
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteUserModalOpen(true)}>
                사용자 삭제
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          setOpen={setIsChangePasswordModalOpen}
          onSuccess={refetch}
          user={user}
        />
      )}

      {isDeleteUserModalOpen && (
        <DeleteUserModal
          open={isDeleteUserModalOpen}
          setOpen={setIsDeleteUserModalOpen}
          onSuccess={refetch}
          user={user}
        />
      )}
    </TableRow>
  );
}
