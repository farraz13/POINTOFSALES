$(document).ready(function () {
    $('#tableUsers').DataTable({
        "lengthMenu": [[3, 5,10, -1], [3, 5, 10, "All"]],
        "processing": true,
        "serverSide": true,
        "ajax": "/users/datatable",
        "columns": [
            { "data": "userid" },
            { "data": "email" },
            { "data": "name" },
            { "data": "role" },
            {
                "data": "userid",
                render : function (data){
                    return `
                    
                    <button type="button" class='btn btn-success'><i class="fa-solid fa-pen"></i></button>
                    <a type="button" href ="/users/delete/${data}" class='btn btn-danger'><i class="fa-solid fa-trash"></i></a>
                    
                    `
                }
            },
        ]
    });
});