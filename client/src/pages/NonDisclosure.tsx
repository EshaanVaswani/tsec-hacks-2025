import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";

// Note: You'll need to add jspdf to your dependencies
// npm install jspdf

const SimplePartnershipDeed = () => {
  const [formData, setFormData] = useState({
    place: "",
    day: "",
    month: "",
    year: "",
    businessType: "",
    businessName: "",
    businessAddress: "",
    partners: [
      { name: "", age: "", fatherName: "", address: "" },
      { name: "", age: "", fatherName: "", address: "" },
      { name: "", age: "", fatherName: "", address: "" },
      { name: "", age: "", fatherName: "", address: "" },
    ],
    witnesses: [
      { name: "", address: "" },
      { name: "", address: "" },
    ],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePartnerChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.map((partner, i) =>
        i === index ? { ...partner, [field]: value } : partner
      ),
    }));
  };

  const handleWitnessChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((witness, i) =>
        i === index ? { ...witness, [field]: value } : witness
      ),
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const text = `
  PARTNERSHIP DEED
  
  THIS DEED of Partnership is made at ${formData.place} on this ${
      formData.day
    } day of ${formData.month}, ${formData.year} by and between:
  
  ${formData.partners
    .map((partner, index) =>
      partner.name
        ? `Shri ${partner.name}, aged ${partner.age} years, son of Shri ${
            partner.fatherName
          }, resident of ${partner.address} (Hereinafter called the ${
            ["First", "Second", "Third", "Fourth"][index]
          } Party).`
        : ""
    )
    .filter(Boolean)
    .join("\n\n")}
  
  WHEREAS the parties to this deed have been carrying on the business of ${
    formData.businessType
  } under the name M/s. ${formData.businessName} at ${formData.businessAddress}.
  
  NOW, THEREFORE THIS DEED WITNESSETH:
  
  1. That the partnership business shall continue under the name of M/s. ${
    formData.businessName
  }.
  2. The business type shall be ${formData.businessType}, located at ${
      formData.businessAddress
    }.
  3. Interest at the rate of 18% per annum shall be paid to partners on their capital investment.
  4. Profits and losses shall be shared equally among partners.
  5. The firm’s bank account shall be operated singly or jointly by the partners.
  6. Books of account shall be closed on 31st March each year.
  
  IN WITNESS WHEREOF, the parties to this deed have set their hands on this date.
  
  PARTNERS:
  ${formData.partners
    .map((partner, index) =>
      partner.name ? `${index + 1}. ${partner.name}` : ""
    )
    .filter(Boolean)
    .join("\n")}
  
  WITNESSES:
  ${formData.witnesses
    .map((witness, index) =>
      witness.name ? `${index + 1}. ${witness.name}, ${witness.address}` : ""
    )
    .filter(Boolean)
    .join("\n")}
  `;

    const marginLeft = 10;
    const marginTop = 10;
    const pageWidth = 180; // Adjust for width of text
    doc.text(text, marginLeft, marginTop, { maxWidth: pageWidth });

    doc.save("Partnership_Deed.pdf");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Partnership Deed Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                name="place"
                value={formData.place}
                onChange={handleInputChange}
                placeholder="Place"
              />
            </div>
            <div>
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                placeholder="DD"
              />
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                placeholder="Month"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="YYYY"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessType">Type of Business</Label>
              <Input
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                placeholder="Enter business type"
              />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="Enter business address"
              />
            </div>
          </div>

          {/* Partners Details */}
          {formData.partners.map((partner, index) => (
            <div key={index} className="space-y-4 border p-4 rounded-lg">
              <h3 className="font-semibold">Partner {index + 1} Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={partner.name}
                    onChange={(e) =>
                      handlePartnerChange(index, "name", e.target.value)
                    }
                    placeholder="Partner name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    value={partner.age}
                    onChange={(e) =>
                      handlePartnerChange(index, "age", e.target.value)
                    }
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Father's Name</Label>
                  <Input
                    value={partner.fatherName}
                    onChange={(e) =>
                      handlePartnerChange(index, "fatherName", e.target.value)
                    }
                    placeholder="Father's name"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={partner.address}
                    onChange={(e) =>
                      handlePartnerChange(index, "address", e.target.value)
                    }
                    placeholder="Address"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Witnesses */}
          <div className="space-y-4">
            <h3 className="font-semibold">Witnesses</h3>
            {formData.witnesses.map((witness, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={witness.name}
                    onChange={(e) =>
                      handleWitnessChange(index, "name", e.target.value)
                    }
                    placeholder={`Witness ${index + 1} name`}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={witness.address}
                    onChange={(e) =>
                      handleWitnessChange(index, "address", e.target.value)
                    }
                    placeholder={`Witness ${index + 1} address`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="button" onClick={generatePDF} className="w-full">
            Generate Partnership Deed
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimplePartnershipDeed;
