import { gql } from "@apollo/client";

export const COMPANIES_QUERY = gql`
  query Companies($page: Int!, $perPage: Int!) {
    companies(page: $page, perPage: $perPage) {
      nodes {
        id
        name
        employeesCount
      }
      totalCount
      page
      totalPages
    }
  }
`;

export const COMPANY_QUERY = gql`
  query Company($id: ID!, $employeesPage: Int!, $perPage: Int!) {
    company(id: $id) {
      id
      name
      employees {
        id
        name
        email
        picture
        manager {
          id
        }
      }
      employeePage(page: $employeesPage, perPage: $perPage) {
        nodes {
          id
          name
          email
          picture
        }
        totalCount
        page
        totalPages
      }
    }
  }
`;

export const EMPLOYEE_QUERY = gql`
  query Employee($id: ID!) {
    employee(id: $id) {
      id
      name
      email
      picture
      company {
        id
        name
        employees {
          id
          name
        }
      }
      manager {
        id
        name
      }
      directReports {
        id
        name
        picture
      }
      peers {
        id
        name
        picture
      }
      secondLevelReports {
        id
        name
        picture
      }
    }
  }
`;

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($name: String!) {
    createCompany(name: $name) {
      company {
        id
        name
      }
      errors
    }
  }
`;

export const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($companyId: ID!, $name: String!, $email: String!, $picture: String) {
    createEmployee(companyId: $companyId, name: $name, email: $email, picture: $picture) {
      employee {
        id
      }
      errors
    }
  }
`;

export const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployee($employeeId: ID!) {
    deleteEmployee(employeeId: $employeeId) {
      success
      errors
    }
  }
`;

export const ASSIGN_MANAGER_MUTATION = gql`
  mutation AssignManager($employeeId: ID!, $managerId: ID) {
    assignManager(employeeId: $employeeId, managerId: $managerId) {
      employee {
        id
      }
      errors
    }
  }
`;
